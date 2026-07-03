/**
 * 文本匹配工具 - 用于将语音识别结果与提词器文本进行匹配
 *
 * 核心策略：
 * 1. 将文本按段落拆分，建立字符级索引
 * 2. 使用滑动窗口 + 最长公共子串(LCS)匹配
 * 3. 维护当前读取位置，优先从当前位置向后匹配
 * 4. 支持模糊匹配（忽略标点、空格差异）
 */

/** 预处理文本：去除空格和标点，转为小写 */
function normalizeText(text: string): string {
  return text
    .replace(/[\s\u3000\\n\\r\\t]+/g, '')
    .replace(/[。，、；：？！""''（）《》【】—…·.,;:!?\\-\\[\\]\\(\\)\\"\\']/g, '')
    .toLowerCase();
}

/** 计算最长公共子串长度及在 target 中的结束位置 */
function longestCommonSubstring(
  source: string,
  target: string,
  targetStartOffset: number
): { length: number; endIndex: number } {
  const m = source.length;
  const n = Math.min(target.length - targetStartOffset, 200); // 限制搜索窗口
  if (m === 0 || n <= 0) return { length: 0, endIndex: -1 };

  let maxLen = 0;
  let endIndex = -1;
  const dp: number[][] = Array.from({ length: 2 }, () => new Array(n + 1).fill(0));

  const effectiveTarget = target.slice(targetStartOffset, targetStartOffset + n);

  for (let i = 1; i <= m; i++) {
    const curr = i & 1;
    const prev = 1 - curr;
    for (let j = 1; j <= n; j++) {
      if (source[i - 1] === effectiveTarget[j - 1]) {
        dp[curr][j] = dp[prev][j - 1] + 1;
        if (dp[curr][j] > maxLen) {
          maxLen = dp[curr][j];
          endIndex = targetStartOffset + j - 1;
        }
      } else {
        dp[curr][j] = 0;
      }
    }
  }

  return { length: maxLen, endIndex };
}

/** 将段落数组拼接为完整文本，返回文本和段落位置映射 */
export function buildParagraphMap(paragraphs: string[]): {
  fullText: string;
  paragraphOffsets: number[];
} {
  let fullText = '';
  const paragraphOffsets: number[] = [];

  for (const p of paragraphs) {
    paragraphOffsets.push(fullText.length);
    fullText += p;
  }

  return { fullText, paragraphOffsets };
}

/** 查找字符位置所属的段落索引 */
export function findParagraphIndex(
  charIndex: number,
  paragraphOffsets: number[]
): number {
  for (let i = paragraphOffsets.length - 1; i >= 0; i--) {
    if (charIndex >= paragraphOffsets[i]) {
      return i;
    }
  }
  return 0;
}

/**
 * 主匹配函数
 * @param recognizedText 语音识别结果
 * @param fullText 提词器完整文本（已拼接）
 * @param currentOffset 当前读取位置的字符偏移量
 * @returns 匹配到的目标位置字符偏移量，-1 表示未匹配
 */
export function matchRecognizedText(
  recognizedText: string,
  fullText: string,
  currentOffset: number
): number {
  if (!recognizedText || !fullText) return -1;

  const normalizedRecognized = normalizeText(recognizedText);
  const normalizedFullText = normalizeText(fullText);

  if (normalizedRecognized.length < 2) return -1; // 太短不处理

  // 优先从当前位置向后搜索
  const searchStart = Math.max(0, normalizeText(fullText.slice(0, currentOffset)).length - 20);

  const { length: matchLen, endIndex } = longestCommonSubstring(
    normalizedRecognized,
    normalizedFullText,
    searchStart
  );

  // 匹配阈值：至少 2 个字符匹配
  if (matchLen < 2) return -1;

  // 将归一化文本中的位置映射回原始文本位置
  return mapNormalizedToOriginal(matchLen, endIndex, fullText);
}

/**
 * 将归一化文本的匹配位置映射回原始文本位置
 * 这是一个近似映射，找到归一化文本中 endIndex 位置附近的原始文本位置
 */
function mapNormalizedToOriginal(
  _matchLen: number,
  normalizedEndIndex: number,
  originalText: string
): number {
  let normalizedPos = 0;
  let originalPos = 0;

  while (originalPos < originalText.length && normalizedPos < normalizedEndIndex) {
    const char = originalText[originalPos];
    const isSkippable =
      /^[\s\u3000\\n\\r\\t。，、；：？！""''（）《》【】—…·.,;:!?\\-\\[\\]\\(\\)\\"\\']$/.test(char);

    if (!isSkippable) {
      normalizedPos++;
    }
    originalPos++;
  }

  return Math.min(originalPos, originalText.length - 1);
}

/**
 * 获取段落在页面上的大致滚动位置（像素）
 */
export function getParagraphScrollPosition(
  paragraphIndex: number,
  totalParagraphs: number
): number {
  const textContainer = document.querySelector('.teleprompter-text');
  if (!textContainer) {
    // 估算：每个段落约占总高度的 1/totalParagraphs
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const textStart = viewportHeight; // 100vh spacer
    const textHeight = documentHeight - 2 * viewportHeight;
    return textStart + (paragraphIndex / Math.max(totalParagraphs, 1)) * textHeight;
  }

  const paragraphs = textContainer.querySelectorAll('p');
  if (paragraphs.length === 0) return window.innerHeight;

  const targetP = paragraphs[Math.min(paragraphIndex, paragraphs.length - 1)];
  const rect = targetP.getBoundingClientRect();
  const scrollTop = window.scrollY + rect.top - window.innerHeight * 0.35;

  return Math.max(0, scrollTop);
}
