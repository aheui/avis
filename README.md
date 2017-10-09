<img
    src="./aheui.svg"
    align="left"
    width="100"
    height="100"
    style="padding-right: 20px; filter: saturate(0) brightness(6) drop-shadow(4px 4px 8px rgba(0,0,0,0.3));">

# [AVIS](http://aheui.github.io/avis/)
한글로 쓰는 난해한 프로그래밍 언어 [아희](http://aheui.github.io/introduction.ko)의 코드 편집기이자 실행기입니다.

전통적인 아희 실행기 [jsaheui](http://aheui.github.io/jsaheui/jsaheui_ko.html)의 기능을 전부 포함하며, 다음과 같은 특징을 가지고 있습니다:

- 코드공간이 엑셀처럼 격자식으로 되어있어 세로방향으로 진행하는 코드를 읽기 편합니다.
- 작성한 코드를 저장하고 url로 공유할 수 있습니다.
- 커서가 지나간 자취를 이해하기 쉽게 보여줍니다.
- <del>잘 만들었습니다.</del>

## 지원 브라우저
PC 크롬, 파이어폭스의 최신 안정버전만 지원합니다.

[정식 지원은 아니지만 폰에서도 잘 도는거 같아요..!!](https://twitter.com/disjukr/status/917292484719288320)

## 미리보기
#### 코드를 중간부터 작성할 수도 있고
![중간부터 작성할 수도 있어요 우왕](./readme/중간부터.gif)

#### 세로쓰기가 가능하고
![세로로 코드를 작성할 수 있어요](./readme/세로쓰기.gif)

#### 작성중인 코드를 바로 돌려볼 수도 있고
![커서가 지나간 자취를 화면에 그려줘요](./readme/실행경로.gif)

#### 작성한 코드를 gist로 저장해서 다른사람들과 공유할 수 있습니다!
![gist로 저장할 수 있어요](./readme/저장하기.png)

## 개발에 참여하기
nodejs가 설치돼있어야 합니다.

### 개발서버 띄우기
- `npm install && npm run dev`
- 웹브라우저를 열어서 <http://0.0.0.0:4715> 로 들어갑니다.

### 배포
- `dist` 폴더를 삭제합니다.
- `npm install && npm run build`
- `dist` 폴더가 생긴 것을 확인합니다.
- https://github.com/aheui/avis 저장소의 `gh-pages` 브랜치에 PR을 날립니다.
