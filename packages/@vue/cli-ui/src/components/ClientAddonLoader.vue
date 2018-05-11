<script>
import CLIENT_ADDONS from '../graphql/clientAddons.gql'
import CLIENT_ADDON_ADDED from '../graphql/clientAddonAdded.gql'

export default {
  apollo: {
    clientAddons: {
      query: CLIENT_ADDONS,
      fetchPolicy: 'no-cache',
      manual: true,
      result ({ data: { clientAddons } }) {
        clientAddons.forEach(this.loadAddon)
      }
    },

    $subscribe: {
      clientAddonAdded: {
        query: CLIENT_ADDON_ADDED,
        result ({ data }) {
          this.loadAddon(data.clientAddonAdded)
        }
      }
    }
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
