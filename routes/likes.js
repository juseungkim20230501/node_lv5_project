const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const { Posts, Likes, sequelize } = require('../models');

// 게시글 좋아요, 좋아요 취소
router.put('/posts/:postId/like', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  const post = await Posts.findOne({ where: { postId } });
  const like = await Likes.findOne({
    where: { UserId: userId, PostId: postId },
  });
  try {
    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    if (like) {
      if (like.UserId === userId) {
        await Likes.destroy({ where: { UserId: userId, PostId: postId } });
        return res
          .status(200)
          .json({ message: '게시글의 좋아요를 취소하였습니다.' });
      }
    }
    await Likes.create({ UserId: userId, PostId: postId });
    return res.status(200).json({ message: '좋아요 등록에 성공하였습니다.' });
  } catch (error) {
    console.error;
    res.status(500).json({ errorMessage: '게시글 좋아요에 실패하였습니다.' });
  }
});

// 좋아요 게시글 조회
router.get('/posts/like', authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const likedPosts = await Likes.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Posts,
          attributes: ['nickname', 'title', 'createdAt', 'updatedAt'],
          include: {
            model: Likes,
            attributes: [
              [
                sequelize.fn('COUNT', sequelize.col('Likes.UserId')),
                'likeCount',
              ],
            ],
          },
        },
      ],
      group: ['PostId'],
      order: [[sequelize.literal('COUNT(Likes.UserId)'), 'DESC']],
      raw: true,
      nest: true,
    });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errorMessage: '좋아요한 게시물 조회에 실패하였습니다.' });
  }
});

module.exports = router;
