import React, { useEffect, useRef } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { Line } from 'react-chartjs-2';
import { useChart, useChartTickLabel } from '@/components/server/console/chart';
import { hexToRgba } from '@/lib/helpers';
import { bytesToString } from '@/lib/formatters';
import { CloudDownloadIcon, CloudUploadIcon } from '@heroicons/react/solid';
import { theme } from 'twin.macro';
import ChartBlock from '@/components/server/console/ChartBlock';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

export default () => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });
    const { t } = useTranslation();

    const createGradient = (canvas: HTMLCanvasElement, color: string) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return color;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, hexToRgba(color, 0.3));
        gradient.addColorStop(1, hexToRgba(color, 0));
        return gradient;
    };

    const cpu = useChart(t('console.graphs.cpu'), {
        sets: 1,
        options: {
            scales: {
                y: {
                    suggestedMax: limits.cpu,
                    grid: {
                        display: true,
                        color: 'rgba(156, 163, 175, 0.3)', 
                        drawBorder: false,
                    },
                    ticks: {
                        display: true,
                        color: 'rgba(156, 163, 175, 0.8)', 
                        callback(value) {
                            return `${value}%`;
                        },
                    },
                },
            },
        },
        callback: (dataset) => ({
            ...dataset,
            label: t('console.graphs.cpu'),
            borderColor: '#3b82f6',
            backgroundColor: (context: any) => {
                const canvas = context.chart.canvas;
                return createGradient(canvas, '#3b82f6');
            },
            fill: true,
        }),
    });
    
    const memory = useChart(t('console.graphs.memory'), {
        sets: 1,
        options: {
            scales: {
                y: {
                    suggestedMax: limits.memory,
                    grid: {
                        display: true,
                        color: 'rgba(156, 163, 175, 0.3)', 
                        drawBorder: false,
                    },
                    ticks: {
                        display: true,
                        color: 'rgba(156, 163, 175, 0.8)', 
                        callback(value) {
                            return `${value}MiB`;
                        },
                    },
                },
            },
        },
        callback: (dataset) => ({
            ...dataset,
            label: t('console.graphs.memory'),
            borderColor: '#a855f7',
            backgroundColor: (context: any) => {
                const canvas = context.chart.canvas;
                return createGradient(canvas, '#a855f7');
            },
            fill: true,
        }),
    });
    const network = useChart(t('console.graphs.network'), {
        sets: 2,
        options: {
            scales: {
                y: {
                    grid: {
                        display: true,
                        color: 'rgba(156, 163, 175, 0.3)', 
                        drawBorder: false,
                    },
                    ticks: {
                        display: true,
                        color: 'rgba(156, 163, 175, 0.8)', 
                        callback(value) {
                            return bytesToString(typeof value === 'string' ? parseInt(value, 10) : value);
                        },
                    },
                },
            },
        },
        callback(opts, index) {
            const color = !index ? '#3b82f6' : '#a855f7';
            return {
                ...opts,
                label: !index ? t('console.graphs.networkIn') : t('console.graphs.networkOut'),
                borderColor: color,
                backgroundColor: (context: any) => {
                    const canvas = context.chart.canvas;
                    return createGradient(canvas, color);
                },
                fill: true,
            };
        },
    });

    useEffect(() => {
        if (status === 'offline') {
            cpu.clear();
            memory.clear();
            network.clear();
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }
        cpu.push(values.cpu_absolute);
        memory.push(Math.floor(values.memory_bytes / 1024 / 1024));
        network.push([
            previous.current.tx < 0 ? 0 : Math.max(0, values.network.tx_bytes - previous.current.tx),
            previous.current.rx < 0 ? 0 : Math.max(0, values.network.rx_bytes - previous.current.rx),
        ]);

        previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };
    });

    return (
        <>
            <ChartBlock title={'CPU Load'}>
                <Line {...cpu.props} />
            </ChartBlock>
            <ChartBlock title={'Memory Usage'}>
                <Line {...memory.props} />
            </ChartBlock>
            <ChartBlock
                title={'Network Traffic'}
                legend={
                    <>
                        <div className="inline-flex items-center mr-4">
                            <span 
                                className="w-2.5 h-2.5 inline-block rounded-sm mr-2" 
                                style={{backgroundColor: '#3b82f6'}}
                            ></span>
                            <span className="text-xs" style={{color: 'var(--theme-text-muted)'}}>
                                Network In
                            </span>
                        </div>
                        <div className="inline-flex items-center">
                            <span 
                                className="w-2.5 h-2.5 inline-block rounded-sm mr-2" 
                                style={{backgroundColor: '#a855f7'}}
                            ></span>
                            <span className="text-xs" style={{color: 'var(--theme-text-muted)'}}>
                                Network Out
                            </span>
                        </div>
                    </>
                }
            >
                <Line {...network.props} />
            </ChartBlock>
        </>
    );
};