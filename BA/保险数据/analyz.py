import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# 设置绘图风格与中文/负号显示（若是在英文系统运行可保持默认）
sns.set_theme(style="whitegrid")
plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial']
plt.rcParams['axes.unicode_minus'] = False

def clean_insurance_data(file_path):
    print(">>> 1. 正在加载并清洗数据...")
    df = pd.read_csv(file_path)
    
    # 替换缺失值/无效值占位符 99999 / 99999.0 为 NaN
    cols_99999 = [
        'RETENTION_RATIO', 'LOSS_RATIO', 'LOSS_RATIO_3YR', 'GROWTH_RATE_3YR', 
        'PL_START_YEAR', 'PL_END_YEAR', 'COMMISIONS_START_YEAR', 'COMMISIONS_END_YEAR', 
        'CL_START_YEAR', 'CL_END_YEAR', 'ACTIVITY_NOTES_START_YEAR', 'ACTIVITY_NOTES_END_YEAR'
    ]
    for col in cols_99999:
        if col in df.columns:
            df[col] = df[col].replace(99999.0, np.nan).replace(99999, np.nan)
            
    # 特殊代理商ID占位符清洗
    df['PRIMARY_AGENCY_ID'] = df['PRIMARY_AGENCY_ID'].replace(99999, np.nan)
    
    # 衍生新指标 (Feature Engineering)
    # 保费单位换算为百万美元 (Million USD)
    df['WRTN_PREM_MILLIONS'] = df['WRTN_PREM_AMT'] / 1e6
    df['NB_PREM_MILLIONS'] = df['NB_WRTN_PREM_AMT'] / 1e6
    
    # 人均销售保费 (Productivity)
    df['PREM_PER_PRODUCER'] = np.where(
        df['ACTIVE_PRODUCERS'] > 0, 
        df['WRTN_PREM_AMT'] / df['ACTIVE_PRODUCERS'], 
        np.nan
    )
    
    print(f"清洗完成！数据总量: {len(df):,} 条记录，包含 {df['AGENCY_ID'].nunique():,} 家独立代理商。")
    return df

def generate_eda_charts(df):
    print(">>> 2. 正在生成分析图表...")
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('P&C Insurance Portfolio & Agency Performance Analysis', fontsize=18, fontweight='bold', y=0.95)

    # 图 1: 历年总保费演变趋势 (按商业险 CL vs 个人险 PL)
    yearly_prem = df.groupby(['STAT_PROFILE_DATE_YEAR', 'PROD_LINE'])['WRTN_PREM_MILLIONS'].sum().unstack()
    yearly_prem.plot(ax=axes[0, 0], marker='o', linewidth=2.5)
    axes[0, 0].set_title('1. Annual Written Premium Trend (by Product Line)', fontsize=13, fontweight='bold')
    axes[0, 0].set_xlabel('Year Profile')
    axes[0, 0].set_ylabel('Total Written Premium ($ Millions)')
    axes[0, 0].grid(True, linestyle='--', alpha=0.6)

    # 图 2: 各州保费贡献度排名 (State Level Market Share)
    state_prem = df.groupby('STATE_ABBR')['WRTN_PREM_MILLIONS'].sum().sort_values(ascending=False).reset_index()
    sns.barplot(data=state_prem, x='WRTN_PREM_MILLIONS', y='STATE_ABBR', palette='Blues_r', ax=axes[0, 1])
    axes[0, 1].set_title('2. Total Written Premium by State (2005-2015)', fontsize=13, fontweight='bold')
    axes[0, 1].set_xlabel('Total Premium ($ Millions)')
    axes[0, 1].set_ylabel('State')

    # 图 3: 各产品线赔付率 (Loss Ratio) 风险分布比较 (剔除极异常值)
    valid_loss = df[(df['LOSS_RATIO'] >= 0) & (df['LOSS_RATIO'] <= 3.0)] # 过滤到300%赔付率以内观察分布
    sns.boxplot(data=valid_loss, x='PROD_LINE', y='LOSS_RATIO', palette='Set2', ax=axes[1, 0])
    axes[1, 0].set_title('3. Loss Ratio Distribution (Commercial vs Personal Line)', fontsize=13, fontweight='bold')
    axes[1, 0].set_xlabel('Product Line (CL: Commercial, PL: Personal)')
    axes[1, 0].set_ylabel('Loss Ratio (0.0 - 3.0)')

    # 图 4: 代理商规模与续保率 (Retention Ratio) 散点关系
    retention_df = df.dropna(subset=['RETENTION_RATIO', 'WRTN_PREM_MILLIONS'])
    retention_sample = retention_df[retention_df['RETENTION_RATIO'] <= 1.0].sample(n=3000, random_state=42)
    sns.scatterplot(data=retention_sample, x='RETENTION_RATIO', y='WRTN_PREM_MILLIONS', hue='PROD_LINE', alpha=0.5, ax=axes[1, 1])
    axes[1, 1].set_title('4. Agency Retention Ratio vs. Written Premium', fontsize=13, fontweight='bold')
    axes[1, 1].set_xlabel('Policy Retention Ratio')
    axes[1, 1].set_ylabel('Written Premium ($ Millions)')

    plt.tight_layout(rect=[0, 0, 1, 0.93])
    plt.savefig('insurance_performance_dashboard.png', dpi=300)
    print("图表已成功保存为 'insurance_performance_dashboard.png'！")

def export_summary_metrics(df):
    print(">>> 3. 正在生成业务总结数据摘要...")
    state_summary = df.groupby('STATE_ABBR').agg(
        Total_Premium_M=('WRTN_PREM_MILLIONS', 'sum'),
        Avg_Retention=('RETENTION_RATIO', 'mean'),
        Median_Loss_Ratio=('LOSS_RATIO', 'median'),
        Active_Agencies=('AGENCY_ID', 'nunique')
    ).round(2)
    print("\n================== 各州业务表现总结 ==================")
    print(state_summary)
    
    # 保存清洗后的完整数据集供后续分析/导入Tableau
    df.to_csv('cleaned_insurance_data.csv', index=False)
    print("\n清洗后的完整数据集已保存至 'cleaned_insurance_data.csv'")

if __name__ == '__main__':
    # 确保 finalapi.csv 在当前同级目录下
    df_cleaned = clean_insurance_data('finalapi.csv')
    generate_eda_charts(df_cleaned)
    export_summary_metrics(df_cleaned)