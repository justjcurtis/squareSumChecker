const std = @import("std");

pub const Graph = struct {
    min: u32 = 1,
    max: u32 = 1000,
    squares: []u32 = undefined,
    square_sums_map: [][]u32 = undefined,
    allocator: std.mem.Allocator = undefined,

    pub fn init(self: *Graph) !void {
        if (self.max < self.min) {
            self.max = self.min + 1;
        }
        const num_count = self.max + 1 - self.min;

        self.allocator = std.heap.page_allocator;

        self.squares = try self.allocator.alloc(u32, num_count);

        var i: u32 = 0;
        while (i < num_count) : (i += 1) {
            self.squares[i] = (i + self.min) * (i + self.min);
        }

        // Debug print inside init
        for (self.squares) |square| {
            std.debug.print("{d} ", .{square});
        }
        std.debug.print("\n", .{});
    }

    pub fn deinit(self: *Graph) void {
        self.allocator.free(self.squares);
    }
};
