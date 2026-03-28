import {
  DEFAULT_CULTURE_ARTICLE_COVER,
  DEFAULT_CULTURE_VIDEO_COVER
} from '@/constants/assets'
import { resolveUploadUrl } from '@/utils/uploadUrl'

/**
 * 白茶文化封面：有图则解析上传路径，否则按内容类型返回默认占位图。
 * @param {{ coverImage?: string, contentType?: number }} row
 */
export function resolveCultureCoverSrc(row) {
  if (!row) return DEFAULT_CULTURE_ARTICLE_COVER
  if (row.coverImage) return resolveUploadUrl(row.coverImage)
  return Number(row.contentType) === 2
    ? DEFAULT_CULTURE_VIDEO_COVER
    : DEFAULT_CULTURE_ARTICLE_COVER
}
