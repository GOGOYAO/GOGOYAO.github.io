---
title: 看懂一次 LLM 前向
date: 2026-10-17 20:58:37
status: published
categories: [LLM 推理]
tags: [Transformer, Attention, KV Cache, GQA]
---

通过交互图解串通 LLM 前向计算、张量 shape、模型结构、因果注意力与逐 token 生成，进一步理解 KV Cache、GQA 以及 prefill / decode 的计算过程。附独立张量基础参考笔记。
