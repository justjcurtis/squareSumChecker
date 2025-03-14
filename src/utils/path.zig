const std = @import("std");
const Graph = @import("../models/graph.zig");

const PathError = error{
    NotFound,
};

const allocator = std.heap.c_allocator;

pub fn findPath(squares: *std.AutoHashMap(u32, u32), max: u32, mutex: *std.Thread.Mutex, results: *std.AutoHashMap(u32, std.ArrayList(u32))) void {
    var squareSums = Graph.SqaureSumsMap{};
    squareSums.init(max, squares, allocator) catch {
        return;
    };
    defer squareSums.deinit();

    const result = findPathOptimized(&squareSums, max) catch {
        return;
    };

    // std.debug.print("Found path from {} to {}\n", .{ 1, max });

    mutex.lock();
    results.put(max, result) catch {
        mutex.unlock();
        return;
    };
    mutex.unlock();
}

fn optionSorter(squareSumsMap: *Graph.SqaureSumsMap, a: u32, b: u32) bool {
    const aList = squareSumsMap.get(a);
    const bList = squareSumsMap.get(b);
    return aList.items.len < bList.items.len;
}

fn sortNextOptions(squareSumsMap: *Graph.SqaureSumsMap, nextOptions: *std.ArrayList(u32)) []u32 {
    const slice = nextOptions.items;
    std.mem.sort(u32, slice, squareSumsMap, comptime optionSorter);
    return slice;
}

fn printPath(path: []u32) void {
    std.debug.print("{} - Path: ", .{path.len});
    for (path) |item| {
        std.debug.print("{d} ", .{item});
    }
    std.debug.print("\n", .{});
}

const PathState = struct {
    used: []bool,
    path: []u32,
    path_len: usize,
    max: u32,

    pub fn init(max: u32) !PathState {
        const used = try allocator.alloc(bool, max + 1);
        const path = try allocator.alloc(u32, max);
        return PathState{
            .used = used,
            .path = path,
            .path_len = 0,
            .max = max,
        };
    }

    pub fn reset(self: *PathState) void {
        for (0..self.max + 0) |i| {
            self.used[i] = false;
        }
        self.path_len = 0;
    }

    pub fn deinit(self: *PathState) void {
        allocator.free(self.used);
        allocator.free(self.path);
    }

    pub fn addToPath(self: *PathState, num: u32) void {
        self.path[self.path_len] = num;
        self.used[num] = true;
        self.path_len += 1;
    }

    pub fn removeFromPath(self: *PathState) u32 {
        self.path_len -= 1;
        const num = self.path[self.path_len];
        self.used[num] = false;
        return num;
    }

    pub fn isUsed(self: *PathState, num: u32) bool {
        return self.used[num];
    }

    pub fn getResult(self: *PathState) !std.ArrayList(u32) {
        var result = std.ArrayList(u32).init(allocator);
        try result.appendSlice(self.path[0..self.path_len]);
        return result;
    }
};

pub fn findPathOptimized(squareSums: *Graph.SqaureSumsMap, max: u32) !std.ArrayList(u32) {
    var state = try PathState.init(max);
    defer state.deinit();

    var ends = try getEnds(squareSums, max);
    defer ends.deinit();

    if (ends.items.len > 2) {
        return PathError.NotFound;
    }

    if (ends.items.len > 0) {
        for (ends.items) |end| {
            state.addToPath(end);
            if (try findPathRecursiveOptimized(squareSums, max, &state)) {
                return state.getResult();
            }
            _ = state.reset();
        }
        return PathError.NotFound;
    }

    var allNumbers = std.ArrayList(u32).init(allocator);
    defer allNumbers.deinit();
    var i: u32 = 1;
    while (i <= max) : (i += 1) {
        try allNumbers.append(i);
    }
    std.mem.sort(u32, allNumbers.items, squareSums, comptime optionSorter);

    for (allNumbers.items) |num| {
        state.addToPath(num);
        if (try findPathRecursiveOptimized(squareSums, max, &state)) {
            return state.getResult();
        }
        _ = state.reset();
    }

    return PathError.NotFound;
}

fn findPathRecursiveOptimized(squareSums: *Graph.SqaureSumsMap, max: u32, state: *PathState) !bool {
    const tip = state.path[state.path_len - 1];
    const options = squareSums.get(tip);

    if (options.items.len == 0) {
        return false;
    }

    if (state.path_len == max - 1) {
        state.addToPath(options.items[0]);
        return true;
    }

    if (try fastEndpointCheck(squareSums, max, state)) {
        return false;
    }

    var validOptions = std.ArrayList(u32).init(allocator);
    defer validOptions.deinit();

    for (options.items) |option| {
        if (!state.isUsed(option)) {
            try validOptions.append(option);
        }
    }

    if (validOptions.items.len == 0) {
        return false;
    }

    std.mem.sort(u32, validOptions.items, squareSums, comptime optionSorter);

    if (state.path_len == max - 1 and validOptions.items.len == 1) {
        state.addToPath(validOptions.items[0]);
        return true;
    }

    for (validOptions.items) |option| {
        state.addToPath(option);
        if (try findPathRecursiveOptimized(squareSums, max, state)) {
            return true;
        }
        _ = state.removeFromPath();
    }

    return false;
}

fn fastEndpointCheck(squareSums: *Graph.SqaureSumsMap, max: u32, state: *PathState) !bool {
    var endCount: usize = 0;

    var i: u32 = 1;
    while (i <= max) : (i += 1) {
        if (state.isUsed(i)) continue;

        var availableConnections: usize = 0;
        const connections = squareSums.get(i);

        for (connections.items) |conn| {
            if (!state.isUsed(conn)) {
                availableConnections += 1;
            }
        }

        if (availableConnections == 1) {
            endCount += 1;
            if (endCount > 2) return true;
        } else if (availableConnections == 0) {
            return true;
        }
    }

    return false;
}

pub fn getEnds(squareSumsMap: *Graph.SqaureSumsMap, max: u32) !std.ArrayList(u32) {
    var ends = std.ArrayList(u32).init(allocator);
    var i: u32 = 1;
    while (i <= max) : (i += 1) {
        const list = squareSumsMap.get(i);
        if (list.items.len == 1) {
            try ends.append(i);
        }
        if (list.items.len == 0) {
            return PathError.NotFound;
        }
    }
    return ends;
}

pub fn getArrayMap(arrayList: std.ArrayList(u32)) !std.AutoHashMap(u32, u32) {
    var map = std.AutoHashMap(u32, u32).init(allocator);
    for (arrayList.items) |item| {
        try map.put(item, item);
    }
    return map;
}

pub fn checkForIslandsAndThreeEnds(squareSums: *Graph.SqaureSumsMap, max: u32, path: *std.ArrayList(u32)) !bool {
    var endCount: usize = 0;
    var pathMap = try getArrayMap(path.*);
    defer pathMap.deinit();

    var i: u32 = 1;
    while (i <= max) : (i += 1) {
        if (pathMap.contains(i)) continue;
        if (i < squareSums.map.items.len) {
            const list = squareSums.map.items[i];
            if (list.items.len == 1) {
                endCount += 1;
            }
        }
        if (endCount > 2) return true;
    }
    return false;
}
