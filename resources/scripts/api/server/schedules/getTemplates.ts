import axios from 'axios';

interface TemplateTask {
    id: number;
    schedule_template_id: number;
    action: string;
    payload: string;
    time_offset: number;
    continue_on_failure: boolean;
    created_at: string;
    updated_at: string;
}

interface ScheduleTemplate {
    id: number;
    name: string;
    description: string;
    cron_minute: string;
    cron_hour: string;
    cron_day_of_month: string;
    cron_month: string;
    cron_day_of_week: string;
    created_at: string;
    updated_at: string;
    tasks: TemplateTask[];
}

const getTemplates = async (uuid: string): Promise<ScheduleTemplate[]> => {
    const { data } = await axios.get(`/api/client/servers/${uuid}/schedules/templates`);
    return data;
};

export default getTemplates;