<template>
  <div class="file-diff-view">
    <div class="toolbar">
      <VueIcon icon="cached"/>
      <div class="title">{{ $t('components.file-diff-view.files-changed') }}</div>
      <div class="file-count">{{ fileDiffs.length }}</div>
      <div class="vue-ui-spacer"/>
      <VueInput
        v-model="search"
        icon-left="search"
        :placeholder="$t('components.file-diff-view.search-file')"
      />
      <VueButton
        :icon-left="allCollapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
        :label="$t(`components.file-diff-view.actions.${allCollapsed ? 'expand-all' : 'collapse-all'}`)"
        @click="setCollapsedToAll(!allCollapsed)"
      />
      <VueButton
        icon-left="refresh"
        class="icon-button"
        @click="refresh()"
      />
    </div>
    <div class="list">
      <FileDiff
        v-for="fileDiff of filteredList"
        :key="fileDiff.id"
        :file-diff="fileDiff"
        :collapsed="!!collapsed[fileDiff.id]"
        @update:collapsed="value => $set(collapsed, fileDiff.id, value)"
      />

      <div v-if="!filteredList.length" class="vue-ui-empty">
        <VueIcon icon="check_circle" class="empty-icon"/>
        <span>{{ $t('components.file-diff-view.empty') }}</span>
      </div>
    </div>
    <div class="actions-bar">
      <template v-if="fileDiffs.length">
        <VueButton
          icon-left="vertical_align_bottom"
          :label="$t('components.file-diff-view.actions.commit')"
          class="big primary"
          @click="openCommitModal()"
        />
        <VueButton
          :label="$t('components.file-diff-view.actions.skip')"
          class="big"
          data-testid="skip-button"
          @click="skip()"
        />
      </template>
      <template v-else>
        <VueButton
          icon-left="done"
          :label="$t('components.file-diff-view.actions.continue')"
          class="big primary"
          @click="skip()"
        />
        <VueButton
          :label="$t('components.file-diff-view.actions.refresh')"
          class="big"
          @click="refresh()"
        />
      </template>
    </div>

    <transition name="vue-ui-fade">
      <VueLoadingIndicator
        v-if="loading"
        class="overlay"
      />
    </transition>

    <VueModal
      v-if="showCommitModal"
      :title="$t('components.file-diff-view.modals.commit.title')"
      class="medium"
      @close="showCommitModal = false"
    >
      <div class="default-body">
        <VueFormField
          :title="$t('components.file-diff-view.modals.commit.input')"
          :subtitle="$t('components.file-diff-view.modals.commit.subtitle')"
        >
          <VueInput
            ref="commitMessageInput"
            v-model="commitMessage"
            icon-left="local_offer"
            @keyup.enter="commitMessage && commit()"
          />
        </VueFormField>
      </div>

      <div slot="footer" class="actions space-between">
        <VueButton
          :label="$t('components.file-diff-view.modals.commit.actions.cancel')"
          class="flat"
          @click="showCommitModal = false"
        />
        <VueButton
          :label="$t('components.file-diff-view.modals.commit.actions.commit')"
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
import PageVisibility from '../mixins/PageVisibility'

import FILE_DIFFS from '../graphql/fileDiffs.gql'
import GIT_COMMIT from '../graphql/gitCommit.gql'

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
      showCommitModal: false
    }
  },

  apollo: {
    fileDiffs: {
      query: FILE_DIFFS,
      loadingKey: 'loading',
      fetchPolicy: 'cahe-and-network',
      result () {
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
      return !this.fileDiffs.find(
        fileDiff => !this.collapsed[fileDiff.id]
      )
    },

    filteredList () {
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
        map[fileDiff.id] = value
      })
      this.collapsed = map
    },

    refresh () {
      this.$apollo.queries.fileDiffs.refetch()
    },

    openCommitModal () {
      this.showCommitModal = true
      requestAnimationFrame(() => {
        this.$refs.commitMessageInput.focus()
      })
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
@import "~@/style/imports"

.file-diff-view
  v-box()
  height 100%
  position relative

  .toolbar
    padding $padding-item
    background $md-white
    h-box()
    align-items center

    >>> > *
      space-between-x($padding-item)

    .file-count
      padding 3px 6px
      background darken(@background, 3%)
      border-radius $br

  .list
    flex 100% 1 1
    height 0
    overflow-x hidden
    overflow-y auto
</style>
