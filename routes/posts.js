const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const { Posts } = require('../models');

// 전체 게시글 목록 조회
router.get('/posts', async (req, res) => {
  const posts = await Posts.findAll({
    order: [['createdAt', 'DESC']],
  });
  const viewPost = posts.map((value) => {
    return {
      postId: value.postId,
      userId: value.UserId,
      nickname: value.nickname,
      title: value.title,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    };
  });
  res.json({ posts: viewPost });
});

// 게시글 작성
router.post('/posts', authMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user;
  const { title, content } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ errorMessage: '제목을 입력해주세요.' });
    }

    if (!content) {
      return res.status(400).json({ errorMessage: '내용을 입력해주세요.' });
    }

    await Posts.create({ UserId: userId, nickname, title, content });
    res.status(201).json({ message: '게시글 작성에 성공하였습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '게시글 작성에 실패하였습니다.' });
  }
});

// 게시글 상세 조회
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Posts.findOne({ postId });

    const viewPost = {
      postId,
      userId: post.userId,
      nickname: post.nickname,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
    res.json({ post: viewPost });
  } catch (err) {
    console.error(err);
    res.status(500).send({ errorMessage: '게시글 조회의 실패하였습니다.' });
  }
});

// 게시글 수정
router.put('/posts/:postId', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  const existPost = await Posts.findOne({ postId });
  try {
    if (existPost) {
      if (userId === existPost.userId) {
        await Posts.update(
          // 수정할 컬럼
          { title, content },
          // 일치조건
          { where: { userId } }
        );
        return res
          .status(200)
          .json({ message: '게시글을 정상적으로 수정하였습니다.' });
      } else {
        return res
          .status(401)
          .json({ errorMessage: '게시글 수정 권한이 없습니다.' });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ errorMessage: '게시글 수정에 실패하였습니다.' });
  }
});

// 게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const post = await Posts.findOne({ postId });

  try {
    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    if (userId === post.UserId) {
      await Posts.destroy({ where: { postId } });
      return res.status(200).json({ message: '게시글을 삭제하였습니다.' });
    }
  } catch (error) {
    console.error;
    res.status(500).json({ errorMessage: '게시글 삭제에 실패하였습니다' });
  }
});

module.exports = router;
