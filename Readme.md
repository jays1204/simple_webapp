# 구현 Spec

## 기능 설명 

- 회원 CRUD
	- 회원 가입 및 탈퇴를 할 수 있고 본인 회원 정보 열람 및 수정이 가능하다.
	- 회원은 아이디, 닉네임, 이메일(옵션), 비밀번호로 구성된다.
		- 회원 아이디는 알파벳, 숫자만 지원
	- 가입한 회원에 대해 로그인을 지원한다.
		- 로그인은 쿠키와 세션을 통해 이루어진다.
		- 세션은 서버 메모리에 저장되므로 서버 재시작시에 삭제된다.
    
- 게시글 CRUD
	- 로그인한 사용자는 글을 작성할 수 있다.
		- 글은 로그인한 사용자라면 누구나 조회가 가능하다.
		- 작성된 글에 대한 수정 및 삭제는 작성자만 가능하다.
	- 글은 제목과 내용으로 구성되며 둘 다 최소 글자 수, 최대 글자 수 제한이 존재한다. 

- 각 CRUD는 RestFul HTTP API를 지원한다.  

	
## RestFul API
	- 회원
        - POST /api/v1/users
            - 회원 가입
        - GET /api/v1/users
            - 가입한 사용자 목록 가져오기 
        - GET /api/v1/users/me
            - 내 회원 정보 가져오기 
        - PUT /api/v1/users/me
            - 내 회원 정보 수정하기 (닉네임과 이메일 정보 수정 가능)
        - PUT /api/v1/users/me/password
            - 내 비밀번호 수정하기 
        - DELETE /api/v1/users/me
            - 회원 탈퇴하기
        - GET /api/v1/users/:user_id
            - 주어진 회원 id의 정보 조회하기 
        - PUT /api/v1/users/:user_id
            - 주어진 회원의 정보 수정하기(본인만 가능)
        - DELETE  /api/v1/users/:user_id
            - 주어진 회원 탈회(본인만 가능)
    - 게시물
    	- POST /api/v1/posts
    		- 게시물 작성
    	- GET /api/v1/posts
    		- 최근 게시물 목록 가져오기
    	- GET /api/v1/posts/:post_id
    		- 게시물 단건 가져오기
    	- PUT /api/v1/posts/:post_id
    		- 게시물 수정하기
    	- DELETE /api/v1/posts/:post_id
    		- 게시물 삭제하기
    	

	
    
## 실행 방법
	- node.js version >= 7.2.0 
	- npm install를 통해 라이브러리 설치 이후 npm start 커맨드 혹은 node bin/www 를 이용해 실행
	- 테스트 케이스는 test 디렉토리에 존재
	- npm test 를 통해 테스트 케이스 실행 가능 
	- 테스트 웹 페이지 url : http://localhost:9999/test
