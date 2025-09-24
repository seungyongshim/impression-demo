# Impression Demo

광고 균등 분할 알고리즘 시뮬레이션을 보여주는 React 애플리케이션입니다.

## 🌐 Live Demo

이 애플리케이션은 GitHub Pages를 통해 배포됩니다:
**[https://seungyongshim.github.io/impression-demo](https://seungyongshim.github.io/impression-demo)**

## 🚀 자동 배포

이 프로젝트는 GitHub Actions를 사용하여 자동으로 배포됩니다:

- `main` 브랜치에 푸시할 때마다 자동으로 빌드되고 GitHub Pages에 배포됩니다
- 빌드 과정에서 테스트를 실행하고 프로덕션 빌드를 생성합니다

## 📁 프로젝트 구조

```
impression-demo/
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages 배포 워크플로우
└── ad-distribution-chart/  # React 애플리케이션
    ├── src/
    ├── public/
    └── package.json
```

## 🛠 로컬 개발

```bash
# 종속성 설치
cd ad-distribution-chart
npm install

# 개발 서버 시작
npm start

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
```

## ⚙️ GitHub Pages 설정

GitHub Pages를 활성화하려면:

1. GitHub 저장소의 Settings → Pages로 이동
2. Source를 "GitHub Actions"로 설정
3. `main` 브랜치에 커밋하면 자동으로 배포됩니다

## 📊 기능

- 10일간 10분 단위로 광고 노출량을 균등 분할
- 실제 노출량에 따른 잔여량 재분배 시뮬레이션
- 계획 vs 실제 노출량 비교 차트
- 실시간 시뮬레이션 컨트롤