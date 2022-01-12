<script setup lang="ts">
import { useRoute, useRouter, useData } from 'vitepress'
import { getCurrentInstance, onMounted, watch } from 'vue'
const props = defineProps<{
  options: any
}>()

const vm = getCurrentInstance()
const route = useRoute()
const router = useRouter()
watch(
  () => props.options,
  (value) => {
    update(value)
  }
)
onMounted(() => {
  initialize(props.options)
})
function isSpecialClick(event: MouseEvent) {
  return (
    event.button === 1 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  )
}
function getRelativePath(absoluteUrl: string) {
  const { pathname, hash } = new URL(absoluteUrl)
  return pathname + hash
}
function update(options: any) {
  if (vm && vm.vnode.el) {
    vm.vnode.el.innerHTML =
      '<input id="algolia-search-input" class="search-query">'
    initialize(options)
  }
}
const { lang, site } = useData()
// the search results should be filtered based on the language
const facetFilters: string[] = ['language:' + lang.value]
if (props.options.searchParameters?.facetFilters) {
  facetFilters.push(...props.options.searchParameters.facetFilters)
}
watch(
  lang,
  (newLang, oldLang) => {
    const index = facetFilters.findIndex(
      (filter) => filter === 'language:' + oldLang
    )
    if (index > -1) {
      facetFilters.splice(index, 1, 'language:' + newLang)
    }
  }
)
function initialize(userOptions: any) {
  Promise.all([
    import('docsearch.js/dist/cdn/docsearch.min.js'),
    import('docsearch.js/dist/cdn/docsearch.min.css')
  ]).then(([docsearch]) => {
    const { algoliaOptions = {}} = userOptions
    docsearch.default(Object.assign(
      {},
      userOptions,
      {
        inputSelector: '#algolia-search-input',
        // #697 Make docsearch work well at i18n mode.
        algoliaOptions: {
          ...algoliaOptions,
          facetFilters: [`lang:${lang.value}`].concat(algoliaOptions.facetFilters || [])
        },
        handleSelected: (input, event, suggestion) => {
          const { pathname, hash } = new URL(suggestion.url)

          // Router doesn't handle same-page navigation so we use the native
          // browser location API for anchor navigation
          if (route.path === pathname) {
            window.location.assign(suggestion.url)
          } else {
            const routepath = pathname.replace(site.base, '/')
            const _hash = decodeURIComponent(hash)
            router.go(`${routepath}${_hash}`)
          }
        }
      })
    )
  })
}
</script>

<template>
  <form
    id="search-form"
    class="algolia-search-wrapper search-box"
    role="search"
  >
    <input id="algolia-search-input" class="search-query">
  </form>
</template>

<style>
.search-box {
  flex: 0 0 auto;
  vertical-align: top;
}
.algolia-search-wrapper {
  --border-color: #eaecef;
  --text-color: #2c3e50;
  --accent-color: #3eaf7c;
}

.algolia-search-wrapper > span {
  vertical-align: middle;
}
.algolia-search-wrapper .algolia-autocomplete {
  line-height: normal;
}
.algolia-search-wrapper .algolia-autocomplete .ds-dropdown-menu {
  background-color: #fff;
  border: 1px solid #999;
  border-radius: 4px;
  font-size: 16px;
  margin: 6px 0 0;
  padding: 4px;
  text-align: left;
}
.algolia-search-wrapper .algolia-autocomplete .ds-dropdown-menu:before {
  border-color: #999;
}
.algolia-search-wrapper .algolia-autocomplete .ds-dropdown-menu [class*=ds-dataset-] {
  border: none;
  padding: 0;
}
.algolia-search-wrapper .algolia-autocomplete .ds-dropdown-menu .ds-suggestions {
  margin-top: 0;
}
.algolia-search-wrapper .algolia-autocomplete .ds-dropdown-menu .ds-suggestion {
  border-bottom: 1px solid var(--border-color);
}
.algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion--highlight {
  color: #2c815b;
}
.algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion {
  border-color: var(--border-color);
  padding: 0;
}
.algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--category-header {
  padding: 5px 10px;
  margin-top: 0;
  background: var(--accent-color);
  color: #fff;
  font-weight: 600;
}
.algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--category-header .algolia-docsearch-suggestion--highlight {
  background: rgba(255,255,255,0.6);
}
.algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--wrapper {
  padding: 0;
}
.algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--title {
  font-weight: 600;
  margin-bottom: 0;
  color: var(--text-color);
}
.algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--subcategory-column {
  vertical-align: top;
  padding: 5px 7px 5px 5px;
  border-color: var(--border-color);
  background: #f1f3f5;
}
.algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--subcategory-column:after {
  display: none;
}
.algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--subcategory-column-text {
  color: #555;
}
.algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-footer {
  border-color: var(--border-color);
}
.algolia-search-wrapper .algolia-autocomplete .ds-cursor .algolia-docsearch-suggestion--content {
  background-color: #e7edf3 !important;
  color: var(--text-color);
}
@media (min-width: 719px) {
  .algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--subcategory-column {
    float: none;
    width: 150px;
    min-width: 150px;
    display: table-cell;
  }
  .algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion .algolia-docsearch-suggestion--content {
    float: none;
    display: table-cell;
    width: 100%;
    vertical-align: top;
  }
  .algolia-search-wrapper .algolia-autocomplete .algolia-docsearch-suggestion .ds-dropdown-menu {
    min-width: 515px !important;
  }
}
@media (max-width: 719px) {
  .algolia-search-wrapper .ds-dropdown-menu {
    min-width: calc(100vw - 4rem) !important;
    max-width: calc(100vw - 4rem) !important;
  }
  .algolia-search-wrapper .algolia-docsearch-suggestion--wrapper {
    padding: 5px 7px 5px 5px !important;
  }
  .algolia-search-wrapper .algolia-docsearch-suggestion--subcategory-column {
    padding: 0 !important;
    background: #fff !important;
  }
  .algolia-search-wrapper .algolia-docsearch-suggestion--subcategory-column-text:after {
    content: " > ";
    font-size: 10px;
    line-height: 14.4px;
    display: inline-block;
    width: 5px;
    margin: -3px 3px 0;
    vertical-align: middle;
  }
}

.search-box {
  display: inline-block;
  position: relative;
  margin-left: 1rem;
}
.search-box input {
  cursor: text;
  width: 10rem;
  height: 2rem;
  color: #4e6e8e;
  display: inline-block;
  border: 1px solid #cfd4db;
  border-radius: 2rem;
  font-size: 0.9rem;
  line-height: 2rem;
  padding: 0 0.5rem 0 2rem;
  outline: none;
  transition: all 0.2s ease;
  background: #fff url("./search.svg") 0.6rem 0.5rem no-repeat;
  background-size: 1rem;
}
.search-box input:focus {
  cursor: auto;
  border-color: #3eaf7c;
}
.search-box .suggestions {
  background: #fff;
  width: 20rem;
  position: absolute;
  top: 2rem;
  border: 1px solid #cfd4db;
  border-radius: 6px;
  padding: 0.4rem;
  list-style-type: none;
}
.search-box .suggestions.align-right {
  right: 0;
}
.search-box .suggestion {
  line-height: 1.4;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
}
.search-box .suggestion a {
  white-space: normal;
  color: #5d82a6;
}
.search-box .suggestion a .page-title {
  font-weight: 600;
}
.search-box .suggestion a .header {
  font-size: 0.9em;
  margin-left: 0.25em;
}
.search-box .suggestion.focused {
  background-color: #f3f4f5;
}
.search-box .suggestion.focused a {
  color: #3eaf7c;
}
@media (max-width: 959px) {
  .search-box input {
    cursor: pointer;
    width: 0;
    border-color: transparent;
    position: relative;
  }
  .search-box input:focus {
    cursor: text;
    left: 0;
    width: 10rem;
  }
}
@media all and (-ms-high-contrast: none) {
  .search-box input {
    height: 2rem;
  }
}
@media (max-width: 959px) and (min-width: 719px) {
  .search-box .suggestions {
    left: 0;
  }
}
@media (max-width: 719px) {
  .search-box {
    margin-right: 0;
  }
  .search-box input {
    left: 1rem;
  }
  .search-box .suggestions {
    right: 0;
  }
}
@media (max-width: 419px) {
  .search-box .suggestions {
    width: calc(100vw - 4rem);
  }
  .search-box input:focus {
    width: 8rem;
  }
}
</style>
