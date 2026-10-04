---
title: CUDA：SM 资源限制、Warp 调度与 Occupancy
date: 2026-10-04 00:00:00
updated: 2026-10-04 14:30:00
permalink: posts/cuda-sm-warp-occupancy/
interactive: cuda-sm-warp-occupancy.html
display: full-html
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
