<template>
  <div class="file-diff-view">
    <div class="toolbar">
      <VueIcon icon="cached"/>
      <div class="title">{{ $t('org.vue.components.file-diff-view.files-changed') }}</div>
      <div class="file-count">{{ fileDiffs && fileDiffs.length }}</div>
      <transition name="vue-ui-fade">
        <VueLoadingIndicator
          v-if="loading && fileDiffs.length"
          class="small accent"
        />
      </transition>
      <div class="vue-ui-spacer"/>
      <VueInput
        v-model="search"
        icon-left="search"
        :placeholder="$t('org.vue.components.file-diff-view.search-file')"
      />
      <VueButton
        :icon-left="allCollapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
        :label="$t(`org.vue.components.file-diff-view.actions.${allCollapsed ? 'expand-all' : 'collapse-all'}`)"
        @click="setCollapsedToAll(!allCollapsed)"
      />
      <VueButton
        icon-left="refresh"
        class="icon-button"
        @click="refresh()"
      />
    </div>
    <div class="list">
      <div v-if="error || !fileDiffs" class="vue-ui-empty">
        <VueIcon icon="error" class="empty-icon"/>
        <span>{{ $t('org.vue.components.file-diff-view.error') }}</span>
      </div>

      <div v-else-if="!filteredList.length" class="vue-ui-empty">
        <VueIcon icon="check_circle" class="empty-icon"/>
        <span>{{ $t('org.vue.components.file-diff-view.empty') }}</span>
      </div>

      <template v-else>
        <FileDiff
          v-for="fileDiff of filteredList"
          :key="fileDiff.id"
          :file-diff="fileDiff"
          :collapsed="!!collapsed[fileDiff.id]"
          @update:collapsed="value => $set(collapsed, fileDiff.id, value)"
        />
      </template>
    </div>
    <div class="actions-bar">
      <template v-if="!error && fileDiffs && fileDiffs.length">
        <VueButton
          icon-left="vertical_align_bottom"
          :label="$t('org.vue.components.file-diff-view.actions.commit')"
          class="big primary"
          @click="showCommitModal = true"
        />
        <VueButton
          :label="$t('org.vue.components.file-diff-view.actions.skip')"
          class="big"
          data-testid="skip-button"
          @click="skip()"
        />
      </template>
      <template v-else>
        <VueButton
          icon-left="done"
          :label="$t('org.vue.components.file-diff-view.actions.continue')"
          class="big primary"
          data-testid="skip-button"
          @click="skip()"
        />
        <VueButton
          :label="$t('org.vue.components.file-diff-view.actions.refresh')"
          icon-left="refresh"
          class="big"
          @click="refresh()"
        />
      </template>
    </div>

    <transition name="vue-ui-fade">
      <VueLoadingIndicator
        v-if="loading && !fileDiffs.length"
        class="accent big overlay"
      />
    </transition>

    <VueModal
      v-if="showCommitModal"
      :title="$t('org.vue.components.file-diff-view.modals.commit.title')"
      class="medium"
      @close="showCommitModal = false"
    >
      <div class="default-body">
        <VueFormField
          :title="$t('org.vue.components.file-diff-view.modals.commit.input')"
          :subtitle="$t('org.vue.components.file-diff-view.modals.commit.subtitle')"
        >
          <VueInput
            v-model="commitMessage"
            icon-left="local_offer"
            v-focus
            @keyup.enter="commitMessage && commit()"
          />
        </VueFormField>
      </div>

      <div slot="footer" class="actions center">
        <VueButton
          :label="$t('org.vue.components.file-diff-view.modals.commit.actions.cancel')"
          class="flat"
          @click="showCommitModal = false"
        />
        <VueButton
          :label="$t('org.vue.components.file-diff-view.modals.commit.actions.commit')"
          class="primary"
          icon-left="vertical_align_bottom"
          :disabled="!commitMessage"
          @click="commit()"
        />
      </div>
    </VueModal>
  </div>
</template>

<script>
import PageVisibility from '@/mixins/PageVisibility'

import FILE_DIFFS from '@/graphql/git/fileDiffs.gql'
import GIT_COMMIT from '@/graphql/git/gitCommit.gql'

const defaultCollapsed = [
  'yarn.lock',
  'package-lock.json'
]

export default {
  mixins: [
    PageVisibility
  ],

  data () {
    return {
      fileDiffs: [],
      collapsed: {},
      search: '',
      loading: 0,
      commitMessage: '',
      showCommitModal: false,
      error: null
    }
  },

  apollo: {
    fileDiffs: {
      query: FILE_DIFFS,
      loadingKey: 'loading',
      fetchPolicy: 'network-only',
      error (error) {
        this.error = error
      },
      result (result) {
        if (result.errors && result.errors.length) {
          this.error = result.errors[0]
          return
        }

        this.error = null
        this.fileDiffs.forEach(fileDiff => {
          if (typeof this.collapsed[fileDiff.id] === 'undefined' && (
            fileDiff.binary ||
            defaultCollapsed.includes(fileDiff.from) ||
            defaultCollapsed.includes(fileDiff.to)
          )) {
            this.$set(this.collapsed, fileDiff.id, true)
          }
        })
      }
    }
  },

  computed: {
    allCollapsed () {
      if (!this.fileDiffs) return false
      return !this.fileDiffs.find(
        fileDiff => !this.collapsed[fileDiff.id]
      )
    },

    filteredList () {
      if (!this.fileDiffs) return []
      const search = this.search.trim()
      if (search) {
        const reg = new RegExp(search.replace(/\s+/g, '.*'), 'i')
        return this.fileDiffs.filter(
          fileDiff => reg.test(fileDiff.from) || reg.test(fileDiff.to)
        )
      } else {
        return this.fileDiffs
      }
    }
  },

  watch: {
    documentFocus (value) {
      if (value) {
        this.refresh()
      }
    }
  },

  methods: {
    setCollapsedToAll (value) {
      const map = {}
      this.fileDiffs.forEach(fileDiff => {
        map[fileDiff.id] = value ||
          defaultCollapsed.includes(fileDiff.from) ||
          defaultCollapsed.includes(fileDiff.to)
      })
      this.collapsed = map
    },

    refresh () {
      this.$apollo.queries.fileDiffs.refetch()
    },

    async commit () {
      this.showCommitModal = false
      this.loading++
      try {
        await this.$apollo.mutate({
          mutation: GIT_COMMIT,
          variables: {
            message: this.commitMessage
          }
        })
        this.refresh()
        this.$emit('continue')
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
      this.loading--
    },

    skip () {
      this.$emit('continue')
    }
  }
}
</script>

<style lang="stylus" scoped>
.file-diff-view
  v-box()
  height 100%
  position relative

  .toolbar
    padding $padding-item
    h-box()
    align-items center

    >>> > *
      space-between-x($padding-item)

    .file-count
      padding 3px 6px
      background darken($vue-ui-color-light, 3%)
      border-radius $br
      .vue-ui-dark-mode &
        background $vue-ui-color-dark

  .list
    flex 100% 1 1
    height 0
    overflow-x hidden
    overflow-y auto

  .actions-bar
    .vue-ui-button
      min-width 190px
</style>
