<template>
  <div class="npm-package-search">
    <div class="content vue-ui-disable-scroll">
      <ais-index
        app-id="OFCNCOG2CU"
        api-key="db283631f89b5b8a10707311f911fd00"
        index-name="npm-search"
        :query-parameters="{
          hitsPerPage: pageSize,
          attributesToRetrieve: [
            'name',
            'description',
            'repository',
            'homepage',
            'version',
            'owner',
            'humanDownloadsLast30Days',
            'keywords'
          ],
          attributesToHighlight: [
            'name',
            'description'
          ],
          filters
        }"
      >
        <InstantSearchInput
          ref="searchInput"
          :placeholder="$t('org.vue.views.project-plugins-add.tabs.search.search-input')"
        />
        <ais-results ref="results">
          <PackageSearchItem
            slot-scope="{ result }"
            :pkg="result"
            :selected="selectedIdModel === result.name"
            @click.native="selectedIdModel = result.name"
          />
        </ais-results>
        <ais-no-results>
          <div class="vue-ui-empty">
            <VueIcon icon="search" class="huge"/>
            <div>{{ $t('org.vue.views.project-plugins-add.tabs.search.not-found') }}</div>
          </div>
        </ais-no-results>
        <InstantSearchPagination @page-change="scrollResultsToTop()"/>
      </ais-index>
    </div>

    <div class="actions-bar no-padding-x space-between">
      <VueButton
        icon-left="close"
        :label="$t('org.vue.views.project-plugins-add.tabs.search.buttons.cancel')"
        class="big"
        @click="close()"
      />

      <div class="algolia">
        <img class="ais-logo" src="~@/assets/search-by-algolia.svg">
      </div>

      <VueButton
        icon-left="file_download"
        :label="$t('org.vue.views.project-plugins-add.tabs.search.buttons.install', { target: selectedIdModel || $t('org.vue.views.project-plugins-add.plugin') })"
        class="big primary"
        :disabled="!selectedIdModel"
        data-testid="download-plugin"
        @click="install()"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    selectedId: {
      type: String,
      default: null
    },

    filters: {
      type: String,
      default: null
    },

    pageSize: {
      type: Number,
      default: 20
    }
  },

  data () {
    return {
      internalSelectedId: this.selectedId
    }
  },

  computed: {
    selectedIdModel: {
      get () { return this.internalSelectedId },
      set (value) {
        this.internalSelectedId = value
        this.$emit('update:selectedId', value)
      }
    }
  },

  watch: {
    selectedId (value) {
      if (value !== this.internalSelectedId) {
        this.internalSelectedId = value
      }
    }
  },

  mounted () {
    requestAnimationFrame(() => {
      this.$refs.searchInput.focus()
    })
  },

  methods: {
    close () {
      this.$emit('close')
    },

    install () {
      this.$emit('install', this.selectedIdModel)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.npm-package-search
  height 100%
  display grid
  grid-template-columns 1fr
  grid-template-rows 1fr auto

.algolia
  position absolute
  margin 0 auto
  top 0
  left 0
  width 100%
  height 100%
  pointer-events none
  h-box()
  box-center()
</style>
