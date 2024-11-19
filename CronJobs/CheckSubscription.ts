import { CronJob } from 'cron';
import userService from '../services/user.service';

export const checkSubscription = new CronJob(
	'* * * * * *',
	async () => {
        // Status to end subscription
        var users: any = await userService.find({
			"subscriptions": {
			  $elemMatch: {
				"active": true,
				endDate: { $lte: Date.now() }
			  }
			}
		});

		users.forEach(async (user : any)=> {
			const upcomingPlan = user.subscriptions.filter((el : any) => el.paid && !el.cancelled && !el.active);
			user.subscriptions = user.subscriptions.map((el : any) => {
				if(el.active && el.endDate <= Date.now()) {
					return { ...el, active: false };
				} else if(upcomingPlan[0] && upcomingPlan[0].sid === el.sid) {
					const subscriptionStatus = {
						active: true,
						activeFrom: Date.now()
					};

					const currentDate = new Date();
					if(el.billingCycle === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
					else currentDate.setFullYear(currentDate.getFullYear() + 1);
					subscriptionStatus['endDate'] = currentDate;

					return { ...el, ...subscriptionStatus };
				} else return el;
			});
			await userService.update({ _id: user._id }, user);
		});

	}
);


export default { checkSubscription };