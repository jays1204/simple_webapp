"use strict";

class PostInfo {
  constructor(title, content) {
    this.title = title;
    this.content = content;
  }

  static fetchFromBody(body) {
    return new PostInfo(body.title, body.content);
  }
}

module.exports = PostInfo;
