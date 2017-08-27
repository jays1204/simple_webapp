'use strict';

const express = require('express');
const router = express.Router();
const passport = require('../utils/passport');

const PostInfo = require('../domain/dto/postInfo');
const postService = require('../service/postService');

//게시물 등록하기
router.post("", passport.isLogin, (req, res, next) => {
  let userSession = req.user;
  let bodyData = req.body;

  if (!bodyData) {
    return next(40003);
  }

  let postInfo = PostInfo.fetchFromBody(bodyData);

  if (!postInfo.title || !postInfo.content) {
    return next(40006);
  }

  if (postInfo.title.length < 1 || postInfo.title.length > 50) {
    return next(40010);
  }
  if (postInfo.content.length < 5 || postInfo.content.length > 200) {
    return next(40011);
  }

  return postService.registPost(userSession, postInfo)
    .then(data => {
      return res.json(data);
    })
  .catch(err => {
    return next(err);
  });
});

//게시물 목록 가져오기
router.get("", (req, res, next) => {
  let userSession = req.user;

  return postService.getLatestPosts()
    .then(data => {
      return res.json(data);
    })
  .catch(err => {
    return next(err);
  });
});

//게시물 id로 게시물 단건 정보 가져오기
router.get("/:post_id", (req, res, next) => {
  let userSession = req.user;
  let postId = req.params.post_id;

  if (!postId) {
    return next(4007);
  }

  return postService.findPostItem(postId)
    .then(data => {
      return res.json(data);
    })
  .catch(err => {
    return next(err);
  });
});

//게시물 id로 게시물 단건 수정하기
router.put("/:post_id", passport.isLogin, (req, res, next) => {
  let userSession = req.user;

  let bodyData = req.body
    , postId = req.params.post_id;
  let postInfo = PostInfo.fetchFromBody(bodyData);

  if (!postId) {
    return next(40007);
  }

  return postService.modifyPost(userSession, postId, postInfo)
    .then(data => {
      return res.json(data);
    })
  .catch(err => {
    return next(err);
  });
});

//게시물 id로 게시물 단건 삭제하기
router.delete("/:post_id", passport.isLogin, (req, res, next) => {
  let userSession = req.user;
  let postId = req.params.post_id;

  if (!postId) {
    return next(40007);
  }

  return postService.deletePost(userSession, postId)
    .then(data => {
      return res.json({});
    })
  .catch(err => {
    return next(err);
  });
});

module.exports = router;
