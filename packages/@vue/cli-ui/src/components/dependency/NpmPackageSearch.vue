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
          analyticsTags: [
            'vue-cli-ui'
          ],
          filters
        }"
      >
        <InstantSearchInput
          ref="searchInput"
          :placeholder="$t('org.vue.views.project-plugins-add.tabs.search.search-input')"
        />
        <div ref="resultsBox" class="ais-results-box">
          <ais-results>
            <PackageSearchItem
              slot-scope="{ result }"
              :pkg="result"
              :selected="selectedIdModel === result.name"
              :load-metadata="loadMetadata"
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
        </div>
      </ais-index>
    </div>

    <div class="actions-bar no-padding-x">
      <div class="algolia">
        <img class="ais-logo" src="~@/assets/search-by-algolia.svg">
      </div>

      <div class="vue-ui-spacer"/>

      <slot name="more-actions"/>

      <VueButton
        icon-left="close"
        :label="$t('org.vue.views.project-plugins-add.tabs.search.buttons.cancel')"
        class="big"
        @click="close()"
      />

      <VueButton
        icon-left="file_download"
        :label="selectedIdModel ? $t('org.vue.views.project-plugins-add.tabs.search.buttons.install', { target: selectedIdModel }) : $t('org.vue.views.project-plugins-add.tabs.search.buttons.default-install')"
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
    },

    loadMetadata: {
      type: Boolean,
      default: false
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
    },

    scrollResultsToTop () {
      const el = this.$refs.resultsBox
      if (el) el.scrollTop = 0
    }
  }
}
</script>

<style lang="stylus" scoped>
.npm-package-search
  height 100%
  display flex
  flex-direction column

.content
  flex 100% 1 1
  height 0
  overflow hidden

.algolia
  width 200px
  height 100%
  margin-left $padding-item
  h-box()
  box-center()
</style>
