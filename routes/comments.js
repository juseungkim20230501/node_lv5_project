const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const { Comments, Posts } = require('../models');
const { where } = require('sequelize');

// 댓글 작성
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user;
  const { postId } = req.params;
  const { comment } = req.body;
  try {
    if (!postId) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
    if (!comment) {
      return res.status(400).json({ errorMessage: '댓글을 입력해 주세요.' });
    }
    await Comments.create({
      PostId: postId,
      UserId: userId,
      nickname,
      comment,
    });
    res.status(201).json({ message: '댓글 작성에 성공하였습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '댓글 작성에 실패하였습니다.' });
  }
});

// 댓글 목록 조회
router.get('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const comments = await Comments.findAll({
    where: { postId },
    order: [['createdAt', 'DESC']],
  });
  const post = await Posts.findOne({ where: { postId } });
  try {
    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
    const viewComments = comments.map((comment) => {
      return {
        commentId: comment.commentId,
        userId: comment.UserId,
        nickname: comment.Nickname,
        comment: comment.comment,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    });
    res.status(200).json({ comments: viewComments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
  }
});

// 댓글 수정
router.put(
  '/posts/:postId/comments/:commentId',
  authMiddleware,
  async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const { comment } = req.body;

    const post = await Posts.findOne({ where: { postId } });
    const comments = await Comments.findOne({ where: { commentId } });

    try {
      if (!post) {
        return res
          .status(404)
          .json({ errorMessage: '게시글이 존재하지 않습니다.' });
      }
      if (!comments) {
        return res
          .status(404)
          .json({ errorMessage: '댓글이 존재하지 않습니다.' });
      }
      if (userId !== comments.UserId) {
        return res
          .status(401)
          .json({ errorMessage: '댓글의 수정 권한이 없습니다.' });
      }
      if (!comment) {
        return res.status(400).json({ errorMessage: '댓글을 입력해 주세요.' });
      }
      await Comments.update({ comment }, { where: { commentId } });
      return res.status(200).json({ message: '댓글을 수정하였습니다.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
    }
  }
);

// 댓글 삭제
router.delete(
  '/posts/:postId/comments/:commentId',
  authMiddleware,
  async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;

    const post = await Posts.findOne({ where: { postId } });
    const comments = await Comments.findOne({ where: { commentId } });

    try {
      if (!post) {
        return res
          .status(404)
          .json({ errorMessage: '게시글이 존재하지 않습니다.' });
      }
      if (!comments) {
        return res
          .status(404)
          .json({ errorMessage: '댓글이 존재하지 않습니다.' });
      }
      if (userId !== comments.UserId) {
        return res
          .status(401)
          .json({ errorMessage: '댓글의 삭제 권한이 없습니다.' });
      }

      await Comments.destroy({ where: { commentId } });
      res.status(200).json({ message: '댓글이 삭제 되었습니다.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
    }
  }
);

module.exports = router;
