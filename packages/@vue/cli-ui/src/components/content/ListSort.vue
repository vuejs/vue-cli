<script>
export default {
  functional: true,

  render (h, { props, data }) {
    return h('div', data.scopedSlots.default({ list: props.list.slice().sort(props.compare) }))
  }
}
</script>
