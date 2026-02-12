import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
    token: {
        colorPrimary: '#4f46e5',
        borderRadius: 8,
        fontSize: 14,
        colorBgContainer: '#ffffff',
    },
    components: {
        Layout: {
            headerBg: '#ffffff',
            headerPadding: '0 24px',
            siderBg: '#001529',
        },
        Menu: {
            darkItemBg: '#001529',
            darkItemSelectedBg: '#4f46e5',
        },
        Card: {
            borderRadiusLG: 12,
            paddingLG: 24,
        },
        Button: {
            borderRadius: 8,
        },
        Table: {
            borderRadius: 8,
        },
    },
};
