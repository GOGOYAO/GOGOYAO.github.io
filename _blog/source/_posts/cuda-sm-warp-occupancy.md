---
title: CUDA：SM 资源限制、Warp 调度与 Occupancy
date: 2026-10-04 00:00:00
updated: 2026-10-04 00:00:00
permalink: posts/cuda-sm-warp-occupancy/
categories:
  - GPU 编程
tags:
  - CUDA
  - GPU
  - LLM 推理
description: 从每个 Block 的资源占用出发，理解 SM 驻留数量、瓶颈、Warp 调度和 Occupancy，并用交互图观察参数变化。
---

一个 SM 能驻留多少个 Block，取决于 Threads、Registers、Shared Memory、Block slots 和 Warp slots 的共同限制。交互图把硬件容量、每个 Block 的占用、允许的 Block 数和最终驻留用量放在一起，便于理解瓶颈。

<!-- more -->

## 打开交互示意图

<a class="interactive-link" href="/cuda-sm-warp-occupancy.html" target="_blank" rel="noopener">打开 CUDA SM / Warp / Occupancy 交互图 ↗</a>

可调整每个 Block 的线程数、每个线程的寄存器数，以及每个 Block 的共享内存。图中 SM 参数是一组教学示例，具体 GPU 的硬件上限应按型号确定。

## 如何理解资源限制

对每项资源，先用 **SM 容量 ÷ 每个 Block 占用**，向下取整，得到该资源允许的完整 Block 数；再取各项的最小值。

默认示例为 256 threads/block、64 registers/thread、16 KB shared memory/block：

| 资源 | SM 容量 | 每个 Block 占用 | 最多允许 Blocks |
| --- | ---: | ---: | ---: |
| Threads | 2,048 | 256 | 8 |
| Registers | 65,536 | 16,384 | 4 |
| Shared Memory | 64 KB | 16 KB | 4 |
| Block slots | 32 | 1 | 32 |
| Warp slots | 64 | 8 | 8 |

最终驻留 Blocks = min(8, 4, 4, 32, 8) = **4**。

每个 Block 有 8 个 Warps，因此驻留 Warps = 4 × 8 = **32**，Occupancy = 32 / 64 = **50%**。

瓶颈不一定表示资源完全用尽；剩余资源也可能不足以容纳一个完整 Block。

## 驻留与调度

Block 被分配到 SM 后，它包含的 Warps 成为 resident warps，并占用相应资源。Resident 不表示此刻都在执行：Warp Scheduler 从 ready warps 中选择并 issue 指令，交由相应执行单元处理。
