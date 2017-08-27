"use strict"; 
const moment = require('moment');
const _ = require('lodash');

const models = require('../domain/entity')
, sequelize = models.sequelize
, User = models.User
, Post = models.Post;


//최근 게시물 목록 가져오기
function getLatestPosts() {
  return Post.findAllByLatestActive(true)
    .then(postList => {
      return Promise.resolve(postList);
    })
  .catch(err => {
    logger.error("[getLatestPost]", err);
    return Promise.reject(err);
  });
}

//게시물 등록하기
function registPost(userSession, postInfo) {
  let properties = {
    title: postInfo.title,
    content: postInfo.content
  }
  , post;

  return sequelize.transaction(t => {
    post = Post.build(properties, {transaction: t});

    return post.save({transaction: t})
      .then(savedPost => {
        return User.findByUserId(userSession.username, false, t)
      })
    .then(user => {
      return post.setUser(user, {transaction: t});
    })
    .then(savedPost => {
      let data = savedPost.get({plain: true});
      return Promise.resolve(data);
    });
  })
  .then(results => {
    return Promise.resolve(results);
  })
  .catch(err => {
    logger.error("[registPost]", err);
    return Promise.reject(err);
  });
}


//등록한 게시물 수정하기
function modifyPost(userSession, postId, editPostInfo) {
  let targetPost;
  let post;

  return sequelize.transaction(t => {
    return Post.findById(postId)
      .then(findPost => {
        if (!findPost) {
          return Promise.reject(40006);
        }

        post = findPost;
        return post.getUser({transaction: t});
      })
    .then(author => {
      if (author.userId != userSession.username) {
        logger.info(`[modifyPost] INVALID_USER - author:${author.userId}, session:${userSession.username}`);
        return Promise.reject(40100);
      }

      post.title = editPostInfo.title;
      post.content = editPostInfo.content;
      return post.save({transaction: t});
    });
  })
  .then(editedPost => {
    let data = editedPost.get({plain: true});
    return Promise.resolve(data);
  })
  .catch(err => {
    logger.error("[modifyPost]", err);
    return Promise.reject(err);
  });
}

//게시물 삭제하기
function deletePost(userSession, postId) {
  let post;

  return sequelize.transaction(t => {
    return Post.findById(postId)
      .then(findPost => {
        post = findPost;

        return post.getUser({transaction: t});
      })
    .then(author => {
      if (author.userId != userSession.username) {
        logger.info(`[deletePost] INVALID_USER - author:${author.userId}, session:${userSession.username}`);
        return Promise.reject(40100);
      }

      return post.destroy({transaction: t});
    })
  })
  .then(result => {
    return Promise.resolve();
  })
  .catch(err => {
    logger.error("[deletePost]", err);
    return Promise.reject(err);
  });
}

//게시물 단건 가져오기
function findPostItem(postId) {
  return Post.findById(postId)
    .then(result => {
      let data = result.get({plain: true});
      return Promise.resolve(data);
    })
  .catch(err => {
    logger.error("[findPost]", err);
    return Promise.reject(err);
  });
}

module.exports = {
  registPost: registPost,
  modifyPost: modifyPost,
  getLatestPosts: getLatestPosts,
  deletePost: deletePost,
  findPostItem: findPostItem
};
