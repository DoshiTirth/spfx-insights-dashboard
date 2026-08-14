import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'InsightsDashboardWebPartStrings';
import InsightsDashboard from './components/InsightsDashboard';
import { IInsightsDashboardProps } from './components/IInsightsDashboardProps';
import { IInsightsDashboardWebPartProps } from './IInsightsDashboardWebPartProps';

export default class InsightsDashboardWebPart extends BaseClientSideWebPart<IInsightsDashboardWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IInsightsDashboardProps> = React.createElement(
      InsightsDashboard,
      {
        dashboardTitle: this.properties.dashboardTitle,
        listName: this.properties.listName,
        categoryField: this.properties.categoryField || 'Category',
        valueField: this.properties.valueField || 'Value',
        dateField: this.properties.dateField || 'Created',
        chartType: this.properties.chartType || 'bar',
        siteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient as unknown as SPHttpClient,
        isDarkTheme: !!(this as unknown as { _isDarkTheme?: boolean })._isDarkTheme,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('dashboardTitle', {
                  label: strings.DashboardTitleFieldLabel
                }),
                PropertyPaneTextField('listName', {
                  label: strings.ListNameFieldLabel,
                  description: strings.ListNameFieldDescription
                }),
                PropertyPaneTextField('categoryField', {
                  label: strings.CategoryFieldLabel
                }),
                PropertyPaneTextField('valueField', {
                  label: strings.ValueFieldLabel
                }),
                PropertyPaneTextField('dateField', {
                  label: strings.DateFieldLabel
                }),
                PropertyPaneDropdown('chartType', {
                  label: strings.ChartTypeFieldLabel,
                  options: [
                    { key: 'bar', text: 'Bar' },
                    { key: 'line', text: 'Line' },
                    { key: 'pie', text: 'Pie' },
                    { key: 'doughnut', text: 'Doughnut' }
                  ]
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
