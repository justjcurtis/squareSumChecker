const std = @import("std");
const Graph = @import("models/graph.zig");
const PathUtils = @import("utils/path.zig");

const allocator = std.heap.page_allocator;

fn printSquareSumsMap(squareSumsMap: *Graph.SqaureSumsMap, title: []const u8) void {
    std.debug.print("{s}: \n", .{title});
    var squareSumsMapItr = squareSumsMap.iterator();
    while (squareSumsMapItr.next()) |entry| {
        const key = entry.key;
        const value = entry.value;
        std.debug.print("\t{d}: ", .{key});
        for (value.items) |item| {
            std.debug.print("{d} ", .{item});
        }
        std.debug.print("\n", .{});
    }
    std.debug.print("\n", .{});
}

fn debug() !void {
    var squares = try Graph.getSquares(100, allocator);

    std.debug.print("Squares from main: ", .{});
    var squaresItr = squares.valueIterator();
    while (squaresItr.next()) |valuePtr| {
        const value = valuePtr.*;
        std.debug.print("{d} ", .{value});
    }
    std.debug.print("\n", .{});

    var squareSumsMap = Graph.SqaureSumsMap{};
    try squareSumsMap.init(100, squares, std.heap.page_allocator);

    var clone = try squareSumsMap.getClone();
    clone.remove(1);

    printSquareSumsMap(&squareSumsMap, "Square Sums Map");
    printSquareSumsMap(&clone, "Clone");
}

fn solveInParallel(min: u32, max: u32) !void {
    std.debug.print("Searching for path from {} to {}\n", .{ min, max });
    var squares = try Graph.getSquares(max, allocator);
    var results = std.AutoHashMap(u32, std.ArrayList(u32)).init(allocator);

    {
        // Use a smaller number of threads to reduce contention
        const num_threads = 1;
        std.debug.print("Using {} threads\n", .{num_threads});

        var pool: std.Thread.Pool = undefined;
        try pool.init(std.Thread.Pool.Options{ .allocator = allocator, .n_jobs = num_threads });
        defer pool.deinit();
        var mutex = std.Thread.Mutex{};

        for (min..max + 1) |index| {
            const i = @as(u32, @intCast(index));
            try pool.spawn(PathUtils.findPath, .{ &squares, i, &mutex, &results });
        }
    }

    std.debug.print("Results: \n", .{});
    var resultsItr = results.iterator();
    while (resultsItr.next()) |kv| {
        const key = kv.key_ptr.*;
        const value = kv.value_ptr;
        std.debug.print("{d}: ", .{key});
        for (value.items) |item| {
            std.debug.print("{d} ", .{item});
        }
        std.debug.print("\n", .{});
    }
}

pub fn main() !void {
    const debugMode = false;
    if (debugMode) {
        try debug();
        return;
    }
    const max = 89;
    const min = 1;
    try solveInParallel(min, max);
}
