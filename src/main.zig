const std = @import("std");
const Graph = @import("models/graph.zig");
const PathUtils = @import("utils/path.zig");

const allocator = std.heap.c_allocator;

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
    try squareSumsMap.init(100, squares, allocator);

    var clone = try squareSumsMap.getClone();
    clone.remove(1);

    printSquareSumsMap(&squareSumsMap, "Square Sums Map");
    printSquareSumsMap(&clone, "Clone");
}

fn printResults(results: *std.AutoHashMap(u32, std.ArrayList(u32))) void {
    if (results.count() == 0) {
        std.debug.print("No results found\n", .{});
        return;
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

fn solveInParallel(min: u32, max: u32, results: *std.AutoHashMap(u32, std.ArrayList(u32))) !void {
    std.debug.print("Searching for path from {} to {}\n", .{ min, max });
    var squares = try Graph.getSquares(max, allocator);

    {
        // Use a smaller number of threads to reduce contention
        const num_threads = std.Thread.getCpuCount() catch 1;
        std.debug.print("Using {} threads\n", .{num_threads});

        var mutex = std.Thread.Mutex{};
        var pool: std.Thread.Pool = undefined;
        try pool.init(std.Thread.Pool.Options{ .allocator = allocator, .n_jobs = num_threads });
        defer pool.deinit();

        var i = min;
        while (i <= max) : (i += 1) {
            try pool.spawn(PathUtils.findPath, .{ &squares, i, &mutex, results });
        }
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
    var results = std.AutoHashMap(u32, std.ArrayList(u32)).init(allocator);

    const start = std.time.nanoTimestamp();
    try solveInParallel(min, max, &results);
    const end = std.time.nanoTimestamp();
    const elapsed = @as(f64, @floatFromInt(end - start)) / 1e9;
    printResults(&results);
    std.debug.print("\nTime elapsed: {d:.3}s\n", .{elapsed});
}
