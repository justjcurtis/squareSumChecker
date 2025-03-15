const std = @import("std");
const Graph = @import("models/graph.zig");
const PathUtils = @import("utils/path.zig");

const stdout = std.io.getStdOut().writer();
const allocator = std.heap.c_allocator;

fn print(comptime fmt: []const u8, args: anytype) void {
    _ = stdout.print(fmt, args) catch return;
}

fn printResults(results: *std.AutoHashMap(u32, std.ArrayList(u32)), min: u32, max: u32) void {
    if (results.count() == 0) {
        print("No results found\n", .{});
        return;
    }
    print("Results: \n", .{});
    var index = min;
    while (index <= max) : (index += 1) {
        if (!results.contains(index)) {
            continue;
        }
        const value = results.get(index).?;
        print("{d}: ", .{index});
        for (value.items) |item| {
            print("{d} ", .{item});
        }
        print("\n", .{});
    }
}

fn solveInParallel(min: u32, max: u32, results: *std.AutoHashMap(u32, std.ArrayList(u32))) !void {
    print("Searching for path from {} to {}\n", .{ min, max });
    var squares = try Graph.getSquares(max, allocator);
    const amnt = max - min + 1;
    {
        const num_threads = @min(std.Thread.getCpuCount() catch 1, amnt);
        print("Using {} threads\n", .{num_threads});

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

fn getArgs() !struct { min: u32, max: u32 } {
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    var min: u32 = 1;
    var max: u32 = 1000;

    if (args.len == 2) {
        const value = try std.fmt.parseInt(u32, args[1], 10);
        min = value;
        max = value;
    } else if (args.len == 3) {
        min = try std.fmt.parseInt(u32, args[1], 10);
        max = try std.fmt.parseInt(u32, args[2], 10);
        if (min > max) {
            return error.MinGreaterThanMax;
        }
    } else if (args.len > 3) {
        return error.TooManyArguments;
    }

    return .{ .min = min, .max = max };
}

pub fn main() !void {
    const args = try getArgs();
    const min = args.min;
    const max = args.max;

    var results = std.AutoHashMap(u32, std.ArrayList(u32)).init(allocator);

    const start = std.time.nanoTimestamp();
    try solveInParallel(min, max, &results);
    const end = std.time.nanoTimestamp();
    const elapsed = @as(f64, @floatFromInt(end - start)) / 1e9;
    printResults(&results, min, max);
    print("\nTime elapsed: {d:.3}s\n", .{elapsed});
}
