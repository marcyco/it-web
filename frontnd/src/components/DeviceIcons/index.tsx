import React from 'react';
import { DeviceType, DeviceStatus } from '../../types';
import { DEVICE_ICONS } from '../../constants';
import './index.css';

interface DeviceIconProps {
    type: DeviceType;
    status?: DeviceStatus;
    name?: string;
    position?: { x: number; y: number };
    onClick?: () => void;
    size?: 'small' | 'medium' | 'large';
    showLabel?: boolean;
}

const DeviceIcon: React.FC<DeviceIconProps> = ({
    type,
    status = DeviceStatus.NORMAL,
    name,
    position,
    onClick,
    size = 'medium',
    showLabel = true
}) => {
    const deviceConfig = DEVICE_ICONS[type];
    const getStatusColor = (status: DeviceStatus): string => {
        const colors: Record<DeviceStatus, string> = {
            [DeviceStatus.NORMAL]: '#27ae60',
            [DeviceStatus.WARNING]: '#f39c12',
            [DeviceStatus.ERROR]: '#e74c3c',
            [DeviceStatus.OFFLINE]: '#95a5a6'
        };
        return colors[status];
    };

    const getSizeClass = (size: string): string => {
        const sizes: Record<string, string> = {
            small: 'device-small',
            medium: 'device-medium',
            large: 'device-large'
        };
        return sizes[size] || sizes.medium;
    };

    const renderIcon = () => {
        const iconSize = size === 'small' ? 24 : size === 'large' ? 48 : 32;

        switch (type) {
            case DeviceType.ROUTER:
                return (
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="8" rx="2" />
                        <rect x="6" y="14" width="12" height="6" rx="2" />
                        <line x1="12" y1="10" x2="12" y2="14" />
                        <circle cx="12" cy="17" r="1" />
                    </svg>
                );

            case DeviceType.SWITCH:
                return (
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <line x1="6" y1="12" x2="18" y2="12" />
                        <circle cx="6" cy="12" r="1" fill="currentColor" />
                        <circle cx="12" cy="12" r="1" fill="currentColor" />
                        <circle cx="18" cy="12" r="1" fill="currentColor" />
                    </svg>
                );

            case DeviceType.FIREWALL:
                return (
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M12 12v5" />
                        <rect x="8" y="14" width="8" height="6" rx="1" />
                        <line x1="12" y1="14" x2="12" y2="12" />
                    </svg>
                );

            case DeviceType.HOST:
                return (
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                );

            case DeviceType.GATEWAY:
                return (
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M12 12v5" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                    </svg>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className={`device-icon ${getSizeClass(size)}`}
            style={{
                left: position?.x,
                top: position?.y,
                borderColor: getStatusColor(status)
            }}
            onClick={onClick}
            title={name || deviceConfig?.name}
        >
            <div className="device-icon-wrapper" style={{ color: deviceConfig?.color }}>
                {renderIcon()}
            </div>

            {showLabel && name && (
                <div className="device-label">
                    {name}
                </div>
            )}

            <div className="device-status" style={{ backgroundColor: getStatusColor(status) }} />
        </div>
    );
};

export default DeviceIcon;
