{ "header": {"name": "API", "order": 2}, "order": 1 }
---
# Templates

## function html

### import

```
import { html } from 'lit';
```

### html(strings: TemplateStringsArray, values: Array<unknown>): TemplateResult<T> 

htmlタグはレンダリングされるDOMを抽象化した値(TemplateResult)を返します。
LitコンポーネントはLitテンプレートがレンダリングされるまで何も処理を行いません。
レンダリングする時、現行のレンダリングで使用したテンプレートが前回のレンダリング時に使用したものと同じ場合は要素を全部置き換えるのではなく差分のみ置き換えます。

```
const header = (title: string) => html`<h1>${title}</h1>`;
```
