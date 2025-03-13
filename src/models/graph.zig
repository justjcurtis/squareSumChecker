const std = @import("std");

pub fn getSquares(max: u32, allocator: std.mem.Allocator) !std.AutoHashMap(u32, u32) {
    var squares = std.AutoHashMap(u32, u32).init(allocator);
    const maxSum = (max * 2) - 1;
    var sqrt: u32 = 1;
    while (true) {
        const square = sqrt * sqrt;
        if (square > maxSum) break;
        try squares.put(square, square);
        sqrt += 1;
    }
    return squares;
}

pub fn getSquareSumsMap(max: u32, squares: *std.AutoHashMap(u32, u32), allocator: std.mem.Allocator) !std.ArrayList(std.ArrayList(u32)) {
    // Create an ArrayList of ArrayLists, with index 0 being unused (since we start at 1)
    var squareSumsMap = try std.ArrayList(std.ArrayList(u32)).initCapacity(allocator, max + 1);

    // Initialize all inner ArrayLists
    for (0..max + 1) |_| {
        try squareSumsMap.append(std.ArrayList(u32).init(allocator));
    }

    // Fill the connections
    for (1..max) |i| {
        const a: u32 = @as(u32, @intCast(i));
        for (i + 1..max + 1) |j| {
            const b: u32 = @as(u32, @intCast(j));
            const sum = a + b;
            if (squares.contains(sum)) {
                try squareSumsMap.items[a].append(b);
                try squareSumsMap.items[b].append(a);
            }
        }
    }

    return squareSumsMap;
}

pub const SqaureSumsMap = struct {
    map: std.ArrayList(std.ArrayList(u32)) = undefined,
    max: u32 = 0,

    pub fn init(self: *SqaureSumsMap, max: u32, squares: *std.AutoHashMap(u32, u32), allocator: std.mem.Allocator) !void {
        self.map = try getSquareSumsMap(max, squares, allocator);
        self.max = max;
    }

    pub fn getClone(self: *SqaureSumsMap) !SqaureSumsMap {
        var newMap = try std.ArrayList(std.ArrayList(u32)).initCapacity(std.heap.page_allocator, self.map.items.len);

        // Clone each inner ArrayList
        for (self.map.items) |list| {
            const clonedList = try list.clone();
            try newMap.append(clonedList);
        }

        return SqaureSumsMap{
            .map = newMap,
            .max = self.max,
        };
    }

    // A more efficient version that doesn't clone the entire structure
    pub fn getEfficient(self: *SqaureSumsMap, allocator: std.mem.Allocator) !*SqaureSumsMap {
        const newMap = try allocator.create(SqaureSumsMap);
        newMap.* = SqaureSumsMap{
            .map = self.map,
            .max = self.max,
        };
        return newMap;
    }

    pub fn get(self: *SqaureSumsMap, index: u32) std.ArrayList(u32) {
        if (index < self.map.items.len) {
            return self.map.items[index];
        }
        return std.ArrayList(u32).init(std.heap.page_allocator);
    }

    pub fn remove(self: *SqaureSumsMap, num: u32) void {
        // For each list in the map
        for (self.map.items) |*list| {
            var len = list.items.len;
            var isClean = true;
            while (isClean) {
                isClean = false;
                for (0..len) |i| {
                    if (i >= list.items.len) break;
                    if (list.items[i] == num) {
                        _ = list.swapRemove(i);
                        len -= 1;
                        isClean = true;
                        break;
                    }
                }
            }
        }
    }

    pub fn optionCount(self: *SqaureSumsMap, num: u32) u32 {
        if (num >= self.map.items.len) return 0;
        return @as(u32, @intCast(self.map.items[num].items.len));
    }

    // Custom iterator for the ArrayList-based implementation
    pub const Iterator = struct {
        map: *std.ArrayList(std.ArrayList(u32)),
        index: usize = 0,

        pub fn next(self: *Iterator) ?struct { key: u32, value: *std.ArrayList(u32) } {
            while (self.index < self.map.items.len) {
                const currentIndex = self.index;
                self.index += 1;

                if (currentIndex > 0) { // Skip index 0 as it's not used
                    return .{
                        .key = @intCast(currentIndex),
                        .value = &self.map.items[currentIndex],
                    };
                }
            }
            return null;
        }
    };

    pub fn iterator(self: *SqaureSumsMap) Iterator {
        return Iterator{ .map = &self.map };
    }

    pub fn contains(self: *SqaureSumsMap, index: u32) bool {
        return index < self.map.items.len and self.map.items[index].items.len > 0;
    }

    pub fn deinit(self: *SqaureSumsMap) void {
        for (self.map.items) |*list| {
            list.deinit();
        }
        self.map.deinit();
    }
};
