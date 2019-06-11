
import Vue from 'vue';
import Router from 'vue-router';
import routes from './routes';
import store from '../store/index';

Vue.use(Router);

const router = new Router({
	routes: [...routes],
	mode: 'history'
});

router.beforeEach((to, from, next) => {
	console.log('to: ', to);
	const isAuthenticated = !!store.getters['account/account'];
	console.log('isAuthenticated: ', isAuthenticated);
	if (to.name.startsWith('account')) {
		if (isAuthenticated) return next('/');
		return next();
	}
	if (!isAuthenticated) return next({ name: 'account.unauthorized' });
	return next();
});

export default router;
