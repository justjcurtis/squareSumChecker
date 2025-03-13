const std = @import("std");
const Graph = @import("models/graph.zig").Graph;

pub fn main() !void {
    var graph = Graph{ .min = 1, .max = 10 };
    try graph.init();
    defer graph.deinit();

    std.debug.print("Min: {d}\nMax: {d}\n", .{ graph.min, graph.max });

    std.debug.print("Squares from main: ", .{});
    var squaresItr = graph.squares.valueIterator();
    while (squaresItr.next()) |valuePtr| {
        const value = valuePtr.*;
        std.debug.print("{d} ", .{value});
    }
    std.debug.print("\n", .{});

    std.debug.print("Square sums map from main: \n", .{});
    var squareSumsMapItr = graph.square_sums_map.iterator();
    while (squareSumsMapItr.next()) |kv| {
        const key = kv.key_ptr.*;
        const value = kv.value_ptr.*;
        std.debug.print("\t{d}: ", .{key});
        for (value.items) |item| {
            std.debug.print("{d} ", .{item});
        }
        std.debug.print("\n", .{});
    }
    std.debug.print("\n", .{});
}
