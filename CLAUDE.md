# kids-sudoku

儿童数独网页游戏。纯静态 HTML/CSS/JS，无构建步骤。核心逻辑（boxes/solver/generator/state）
用 UMD-lite 写法，可用 `node --test tests/*.test.js` 跑单元测试。

## Deploy Configuration (configured by /setup-deploy)
- Platform: GitHub Pages
- Production URL: https://icandy7272.github.io/kids-sudoku/
- Deploy workflow: auto-deploy on push to main (Pages legacy build, branch main, path /)
- Deploy status command: gh api repos/icandy7272/kids-sudoku/pages --jq .status
- Merge method: 直接推 main（个人项目，无 PR 流程）
- Project type: web app（静态站点）
- Post-deploy health check: curl -sf https://icandy7272.github.io/kids-sudoku/ -o /dev/null -w "%{http_code}"

### Custom deploy hooks
- Pre-merge: node --test tests/*.test.js
- Deploy trigger: git push origin main（自动触发 Pages 构建）
- Deploy status: gh api repos/icandy7272/kids-sudoku/pages --jq .status（built 即完成）
- Health check: https://icandy7272.github.io/kids-sudoku/
