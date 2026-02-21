import React, { useEffect, useState } from 'react';
import Modal from '@/components/elements/Modal';
import { Button } from '@/components/elements/button/index';
import tw from 'twin.macro';
import createOrUpdateSchedule from '@/api/server/schedules/createOrUpdateSchedule';
import createOrUpdateScheduleTask from '@/api/server/schedules/createOrUpdateScheduleTask';
import getTemplates from '@/api/server/schedules/getTemplates';

interface TemplateModalProps {
    visible: boolean;
    onClose: () => void;
    uuid: string;
    openManualModal: () => void;
    refreshSchedules: () => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ visible, onClose, uuid, openManualModal, refreshSchedules }) => {
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        if (visible) {
            getTemplates(uuid)
                .then(response => {
                    setTemplates(response);
                })
                .catch(error => {
                    console.error('Error fetching templates:', error);
                });
        }
    }, [visible, uuid]);

    const handleTemplateSelect = async (templateId: number) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        const scheduleData = {
            name: template.name,
            cron: {
                minute: template.cron_minute,
                hour: template.cron_hour,
                dayOfMonth: template.cron_day_of_month,
                month: template.cron_month,
                dayOfWeek: template.cron_day_of_week,
            },
            onlyWhenOnline: true,
            isActive: true,
        };

        const schedule = await createOrUpdateSchedule(uuid, scheduleData);

        for (const task of template.tasks) {
            const taskData = {
                action: task.action,
                payload: task.payload,
                timeOffset: task.time_offset,
                continueOnFailure: task.continue_on_failure,
            };

            await createOrUpdateScheduleTask(uuid, schedule.id, undefined, taskData);
        }

        await refreshSchedules();
        onClose();
    };

    return (
        <Modal visible={visible} onDismissed={onClose} showSpinnerOverlay={false}>
            <div>
                <h3 css={tw`text-2xl mb-1`}>Choose a Template</h3>
                <p css={tw`text-sm text-gray-300 mb-2 cursor-pointer`} onClick={openManualModal}>
                    Need more control? <span css={tw`text-blue-500`}>Create from scratch</span>
                </p>
                <div css={tw`mt-4`}>
                    {templates.map(template => (
                        <div key={template.id} css={tw`mt-2 bg-neutral-700 border border-neutral-800 shadow-inner p-4 rounded flex items-center justify-between`}>
                            <div css={tw`flex-grow`}>
                                <h3 css={tw`text-base font-semibold`}>{template.name}</h3>
                                <p css={tw`text-sm text-gray-300`}>{template.description}</p>
                            </div>
                            <Button css={tw`ml-4`} onClick={() => handleTemplateSelect(template.id)}>
                                Create
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default TemplateModal;
