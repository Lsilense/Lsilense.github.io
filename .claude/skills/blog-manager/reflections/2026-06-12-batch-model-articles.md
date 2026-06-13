## 反思：2026-06-12/13 — 批量生成主流模型技术文章

### 任务
按照博客已有风格，批量生成多篇大模型技术文章：DeepSeek-R1、DeepSeek-V4、Qwen2.5（含扩展）、Qwen3、Qwen3.5、Qwen3.6。所有文章均从原始技术报告/论文中提取信息，确保技术细节准确。

### 做得好
- **信息获取策略成功**：使用 arXiv API 搜索论文 ID，直接下载 PDF 全文并用 PyMuPDF 提取关键内容，比依赖 WebSearch 更可靠
- **风格一致性保持良好**：所有文章统一使用 Mermaid 图（3-4 张/篇）、KaTeX 公式、数据表（bench-table / arch-table）、论文引用框、伪代码块，与现有文章完全一致
- **模型演进线索清晰**：Qwen 系列的 5 篇文章形成 `qwen2 → qwen2.5 → qwen3 → qwen3.5 → qwen3.6` 的完整演进链条，读者可以追溯架构变化
- **数据驱动的文章定位准确**：从论文 PDF 提取真实 benchmark 数据，避免了凭印象写错数字
- **Qwen2.5 文章合理扩展而非拆分**：用户提出将 Qwen2.5-Coder/Math 合并进 qwen2.5 文章而非另写独立文章，节省了篇幅且保持了内容完整性
- **无独立论文的模型处理得当**：Qwen3.5 和 Qwen3.6 没有独立的 LLM 技术报告，通过 Omni 论文 + GitHub README 交叉验证获取信息

### 可以改进
- **Hugging Face / GitHub API 受限**：多次尝试从 Hugging Face 获取模型 config.json 和 README 均失败，只能依赖 arXiv PDF 和 GitHub API（GitHub API 成功率更高）。对于无法 arXiv 获取的信息，应优先使用 GitHub API
- **WebSearch 返回值常为空**：在当前网络环境下 WebSearch 工具返回值多为空，不能依赖。应直接使用 arXiv API + PDF 下载作为主要信息渠道
- **模型参数表格获取方式**：Qwen3.5 和 Qwen3.6 的精确参数配置（层数、头数等）无法从外部 API 获取，文章中的规格表以定性描述为主。如需精确配置数据，可能需要用户提供模型卡截图

### 改进措施
- 预置 arXiv PDF 下载 + PyMuPDF 提取的标准化流程，后续写技术文章直接复用
- 对于没有独立论文的模型，优先查找 GitHub README（README 包含的信息往往足够），再辅以相关论文的引述
- 批量生成大量文章时，先确认用户想要的模型列表和优先级，避免做了不需要的文章

---

### 优化结果（第二轮审查后）
- **标签补齐**：`qwen2` 的 tags 从 3 个扩展到 5 个（增加 GQA、推理优化）；`deepseek-v4` 增加 CSA、HCA 标签
- **交叉引用验证**：跨文章引用全部检查通过（deepseek-r1 → V3, deepseek-v4 → V3/R1, qwen 系列链式引用均存在）
- **结构一致性确认**：6 篇文章全部通过 15 项结构检查（nav/footer/main.js/mermaid/katex/post-detail 等），无遗漏
- **图片资源确认**：所有 assets 图片文件存在，引用路径正确