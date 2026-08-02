import {computed, ref} from "vue";
import {useRoute} from "vue-router";

const override = ref<{ path: string; crumbs: string[] } | null>(null)

export function useBreadcrumbs() {
    const route = useRoute()

    const crumbs = computed(() => {
        if (override.value && override.value.path === route.path) {
            return override.value.crumbs
        }
        return route.meta.crumbs ?? []
    })

    function setBreadcrumbs(crumbs: string[] | null) {
        override.value = crumbs ? { path: route.path, crumbs } : null
    }

    return { crumbs, setBreadcrumbs }
}
