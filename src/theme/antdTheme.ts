import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
    token: {
        colorPrimary: '#1677ff',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        colorInfo: '#1677ff',
        colorTextBase: '#1e293b',
        colorBgLayout: '#f8fafc',
        colorBgContainer: '#ffffff',
        borderRadius: 8,
        fontSize: 14,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    components: {
        Layout: {
            headerBg: '#ffffff',
            headerPadding: '0 24px',
            siderBg: '#ffffff',
        },
        Menu: {
            itemBg: '#ffffff',
            itemSelectedBg: '#e6f4ff',
            itemSelectedColor: '#1677ff',
            itemActiveBg: '#f5f5f5',
            itemHoverBg: '#f5f5f5',
            itemBorderRadius: 6,
            itemMarginInline: 8,
        },
        Card: {
            borderRadiusLG: 12,
            paddingLG: 24,
            boxShadowTertiary: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        },
        Button: {
            borderRadius: 6,
            controlHeight: 36,
            fontWeight: 500,
        },
        Table: {
            borderRadius: 8,
            headerBg: '#f8fafc',
            headerColor: '#64748b',
            headerSplitColor: 'transparent',
            rowHoverBg: '#f8fafc',
        },
        Statistic: {
            titleFontSize: 12,
            contentFontSize: 24,
        },
    },
};
