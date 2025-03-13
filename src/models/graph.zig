const std = @import("std");

pub const Graph = struct {
    min: u32 = 1,
    max: u32 = 1000,
    squares: std.AutoHashMap(u32, u32) = undefined,
    square_sums_map: std.AutoHashMap(u32, std.ArrayList(u32)) = undefined,
    allocator: std.mem.Allocator = undefined,

    pub fn init(self: *Graph) !void {
        const stdout = std.io.getStdOut().writer();
        try stdout.print("Initializing graph...\n", .{});
        if (self.max < self.min) {
            self.max = self.min + 1;
        }

        self.allocator = std.heap.page_allocator;
        self.squares = std.AutoHashMap(u32, u32).init(self.allocator);

        var sqrt: u32 = 1;
        while (true) {
            const square = sqrt * sqrt;
            if (square > self.max) break;
            try self.squares.put(square, square);
            sqrt += 1;
        }

        self.square_sums_map = std.AutoHashMap(u32, std.ArrayList(u32)).init(self.allocator);
        for (self.min..self.max) |i| {
            const a: u32 = @as(u32, @intCast(i));
            for (i + 1..self.max + 1) |j| {
                const b: u32 = @as(u32, @intCast(j));
                const sum = a + b;
                if (self.squares.contains(sum)) {
                    if (self.square_sums_map.contains(sum)) {
                        var list = self.square_sums_map.get(sum).?;
                        try list.append(a);
                        try list.append(b);
                    } else {
                        var list = std.ArrayList(u32).init(self.allocator);
                        try list.append(a);
                        try list.append(b);
                        try self.square_sums_map.put(sum, list);
                    }
                }
            }
        }
    }

    pub fn deinit(self: *Graph) void {
        self.squares.deinit();
        self.square_sums_map.deinit();
    }
};
