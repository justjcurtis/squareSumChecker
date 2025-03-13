const std = @import("std");
const Graph = @import("../models/graph.zig");

const PathError = error{
    NotFound,
};

const allocator = std.heap.page_allocator;

pub fn findPath(squares: *std.AutoHashMap(u32, u32), max: u32, mutex: *std.Thread.Mutex, results: *std.AutoHashMap(u32, std.ArrayList(u32))) void {
    var squareSums = Graph.SqaureSumsMap{};
    squareSums.init(max, squares, allocator) catch {
        return;
    };
    defer squareSums.deinit();

    const ends = getEnds(&squareSums, max) catch {
        return;
    };
    defer ends.deinit();

    if (ends.items.len > 2) {
        return;
    }

    if (ends.items.len > 0) {
        for (ends.items) |end| {
            var path = std.ArrayList(u32).init(allocator);
            path.append(end) catch {
                path.deinit();
                continue;
            };

            const result = findPathRecursive(&squareSums, max, &path) catch {
                path.deinit();
                continue;
            };
            std.debug.print("got result for {}\n", .{max});

            mutex.lock();
            results.put(max, result) catch {
                mutex.unlock();
                return;
            };
            mutex.unlock();
            return;
        }
        return;
    }

    for (1..max + 1) |i| {
        var path = std.ArrayList(u32).init(allocator);
        path.append(@intCast(i)) catch {
            path.deinit();
            continue;
        };

        const result = findPathRecursive(&squareSums, max, &path) catch {
            path.deinit();
            continue;
        };
        mutex.lock();
        results.put(max, result) catch {
            mutex.unlock();
            return;
        };
        mutex.unlock();
        break;
    }
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

fn printPath(path: *std.ArrayList(u32)) void {
    for (path.items) |item| {
        std.debug.print("{d} ", .{item});
    }
    std.debug.print("\n", .{});
}

pub fn findPathRecursive(squareSums: *Graph.SqaureSumsMap, max: u32, path: *std.ArrayList(u32)) !std.ArrayList(u32) {
    if (path.items.len == max) {
        return path.*;
    }
    var clone = try squareSums.getClone();
    defer clone.deinit();
    const tip = path.getLast();
    clone.remove(tip);
    var nextOptions = clone.get(tip);

    // Check if there are no next options
    if (nextOptions.items.len == 0) {
        return PathError.NotFound;
    }

    // Check for islands and three ends separately
    var hasIslands = false;
    hasIslands = (checkForIslandsAndThreeEnds(&clone, max, path) catch false);
    if (hasIslands) {
        return PathError.NotFound;
    }

    // Sort the next options by the number of options they have
    const sortedOptions = sortNextOptions(&clone, &nextOptions);

    for (sortedOptions) |option| {
        var pathClone = try path.clone();
        try pathClone.append(option);
        const result = findPathRecursive(&clone, max, &pathClone) catch {
            pathClone.deinit();
            continue;
        };
        return result;
    }
    return PathError.NotFound;
}

pub fn getEnds(squareSumsMap: *Graph.SqaureSumsMap, max: u32) !std.ArrayList(u32) {
    var ends = std.ArrayList(u32).init(allocator);
    for (1..max + 1) |i| {
        const num = @as(u32, @intCast(i));
        if (squareSumsMap.contains(num)) {
            const list = squareSumsMap.get(num);
            if (list.items.len == 1) {
                try ends.append(num);
            }
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
