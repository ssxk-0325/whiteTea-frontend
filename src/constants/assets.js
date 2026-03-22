/**
 * 静态占位图（位于 public/），与 schema 中图片类字段对应关系见下方注释。
 */

/** tb_user.avatar — 用户头像 */
export const DEFAULT_USER_AVATAR = '/default-avatar.svg'

/** tb_product.image / tb_order_item.product_image — 产品主图、订单快照 */
export const DEFAULT_PRODUCT_IMAGE = '/default-product.svg'

/** tb_category.image — 分类图 */
export const DEFAULT_CATEGORY_IMAGE = '/default-category.svg'

/** tb_culture_content.cover_image、tb_experience_activity.image 等封面类 */
export const DEFAULT_COVER_IMAGE = '/default-cover.svg'

/** 首页轮播（无对应库表，仅前端展示） */
export const HOME_BANNERS = [
  { id: 1, title: '福鼎白茶', image: '/images/福鼎白茶.jpg' },
  { id: 2, title: '优质茶叶', image: '/images/优质茶叶.jpg' },
]
