<!-- 分页栏 -->
<template>
  <div class="base-pagination">
    <el-pagination v-if='configs&&configs.total||total'
                   :current-page='configs.pageNum||1'
                   :page-size='configs.pageSize||15'
                   :total='configs.total||total'
                   :page-sizes='configs["page-sizes"]||[15,25,35,50]'
                   layout='total, sizes, prev, pager, next, jumper'
                   @size-change='(val)=>{configs.handleSizeChange?configs.handleSizeChange(val):$emit("size-change",val)}'
                   @current-change='(val)=>{configs.handleCurrentChange?configs.handleCurrentChange(val):$emit("current-change",val)}' />
  </div>
</template>

<script>
export default {
  name: 'BasePagination',
  props: {
    configs: {
      type: Object,
      default () {
        return {}
      }
    },
    total: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
    }
  },
  methods: {

  }
}
</script>

<style lang="scss" >
</style>
