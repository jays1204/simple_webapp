"use strict";

const ERROR_MAP = {
  "40001": {msg: "invalid request", status: 400, detail_code: 40001},
  "40002": {msg: "invalid_user_join_data", status: 400, detail_code: 40002},
  "40003": {msg: "invalid request body", status: 400, detail_code: 40003},
  "40004": {msg: "exist user_id", status: 400, detail_code: 40004},
  "40005": {msg: "exist nickname", status: 400, detail_code: 40005},
  "40006": {msg: "invalid post data", status: 400, detail_code: 40006},
  "40007": {msg: "invalid request uri", status: 400, detail_code: 40007},
  "40008": {msg: "invalid user_id", status: 400, detail_code: 40008},
  "40009": {msg: "invalid nickname", status: 400, detail_code: 40009},
  "40010": {msg: "invalid title length", status: 400, detail_code: 40010},
  "40011": {msg: "invalid content length", status: 400, detail_code: 40011},
  "40100": {msg: "invalid permission", status: 401, detail_code: 40100},
  "40101": {msg: "need autorization", status: 401, detail_code: 400101},
  "50001": {msg: "internal server error", status: 500, detail_code: 50001}
};

//error를 받아서 처리한다. ERROR_MAP에 있는 데이터면 해당 데이터를 내려주고
//아니면 에러 로그를 찍고 서버 에러를 내려준다.
function errorHandler(err_code, req, res, next) {
  let errorInfo = ERROR_MAP[err_code];
 
  if (errorInfo) {
    res.locals.message = errorInfo.msg;
    res.locals.error = errorInfo.msg;
    res.status(errorInfo.status);
  } else {
    logger.error('[errorHandler]', err_code);
    res.status(500);
  }

  return res.json(errorInfo);
}

module.exports = errorHandler;
