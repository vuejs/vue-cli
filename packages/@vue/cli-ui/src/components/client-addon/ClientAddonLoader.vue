<script>
import CLIENT_ADDONS from '@/graphql/client-addon/clientAddons.gql'
import CLIENT_ADDON_ADDED from '@/graphql/client-addon/clientAddonAdded.gql'

export default {
  apollo: {
    clientAddons: {
      query: CLIENT_ADDONS,
      fetchPolicy: 'no-cache',
      manual: true,
      result ({ data: { clientAddons }, stale }) {
        if (!stale) {
          clientAddons.forEach(this.loadAddon)
          this.$_lastRead = Date.now()
        }
      }
    },

    $subscribe: {
      clientAddonAdded: {
        query: CLIENT_ADDON_ADDED,
        result ({ data }) {
          if (this.$_lastRead && Date.now() - this.$_lastRead > 1000) {
            this.loadAddon(data.clientAddonAdded)
          }
        }
      }
    }
  },

  created () {
    this.$_lastRead = null
  },

  methods: {
    loadAddon (addon) {
      // eslint-disable-next-line no-console
      console.log(`[UI] Loading client addon ${addon.id} (${addon.url})...`)
      const script = document.createElement('script')
      script.setAttribute('src', addon.url)
      document.body.appendChild(script)
    }
  },

  render () {
    return null
  }
}
</script>
