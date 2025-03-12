const std = @import("std");
const Graph = @import("models/graph.zig").Graph;

pub fn main() !void {
    std.debug.print("Hello, world!\n", .{});
    var graph = Graph{ .min = 1, .max = 10 };
    try graph.init();
    defer graph.deinit();

    std.debug.print("Min: {d}\nMax: {d}\n", .{ graph.min, graph.max });

    // Now this should work without segmentation fault
    std.debug.print("Squares from main: ", .{});
    for (graph.squares) |square| {
        std.debug.print("{d} ", .{square});
    }
    std.debug.print("\n", .{});
}
