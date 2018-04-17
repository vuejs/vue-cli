<script>
import CLIENT_ADDONS from '../graphql/clientAddons.gql'
import CLIENT_ADDON_ADDED from '../graphql/clientAddonAdded.gql'

export default {
  apollo: {
    clientAddons: {
      query: CLIENT_ADDONS,
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

  created () {
    this.$_scripts = new Map()
  },

  methods: {
    loadAddon (addon) {
      console.log(`Loading addon ${addon.id} (${addon.url})...`)
      const script = document.createElement('script')
      this.$_scripts.set(addon.id, script)
      script.setAttribute('src', addon.url)
      document.body.appendChild(script)
    }
  },

  render () {
    return null
  }
}
</script>
