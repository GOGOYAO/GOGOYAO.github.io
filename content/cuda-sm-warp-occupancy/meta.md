---
title: CUDA：SM 资源限制、Warp 调度与 Occupancy
date: 2026-10-04T00:00:00.000Z
updated: 2026-10-04T14:30:00.000Z
categories:
  - GPU 编程
tags:
  - CUDA
  - GPU
  - LLM 推理
aliases:
  - cuda-sm-warp-occupancy.html
status: published
---
一个 SM 能驻留多少个 Block，取决于 Threads、Registers、Shared Memory、Block slots 和 Warp slots 的共同限制。交互图把硬件容量、每个 Block 的占用、允许的 Block 数和最终驻留用量放在一起，便于理解瓶颈。
