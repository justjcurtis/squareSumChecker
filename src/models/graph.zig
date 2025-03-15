const std = @import("std");
const PathUtils = @import("../utils/path.zig");

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
    var squareSumsMap = try std.ArrayList(std.ArrayList(u32)).initCapacity(allocator, max + 1);

    for (0..max + 1) |_| {
        try squareSumsMap.append(std.ArrayList(u32).init(allocator));
    }

    var i: u32 = 1;
    while (i < max) : (i += 1) {
        var j: u32 = i + 1;
        while (j <= max) : (j += 1) {
            const sum = i + j;
            if (squares.contains(sum)) {
                try squareSumsMap.items[i].append(j);
                try squareSumsMap.items[j].append(i);
            }
        }
    }

    return squareSumsMap;
}

pub const SqaureSumsMap = struct {
    map: std.ArrayList(std.ArrayList(u32)) = undefined,
    max: u32 = 0,
    allocator: std.mem.Allocator = undefined,

    pub fn init(self: *SqaureSumsMap, max: u32, squares: *std.AutoHashMap(u32, u32), allocator: std.mem.Allocator) !void {
        self.map = try getSquareSumsMap(max, squares, allocator);
        self.max = max;
        self.allocator = allocator;
    }

    pub fn getClone(self: *SqaureSumsMap) !SqaureSumsMap {
        var newMap = try std.ArrayList(std.ArrayList(u32)).initCapacity(self.allocator, self.map.items.len);

        for (self.map.items) |list| {
            const clonedList = try list.clone();
            try newMap.append(clonedList);
        }

        return SqaureSumsMap{
            .map = newMap,
            .max = self.max,
        };
    }

    pub fn get(self: *SqaureSumsMap, index: u32) std.ArrayList(u32) {
        if (self.contains(index)) {
            return self.map.items[index];
        }
        unreachable;
    }

    pub fn contains(self: *SqaureSumsMap, index: u32) bool {
        return index < self.map.items.len and index > 0;
    }

    pub fn deinit(self: *SqaureSumsMap) void {
        for (self.map.items) |*list| {
            list.deinit();
        }
        self.map.deinit();
    }
};
