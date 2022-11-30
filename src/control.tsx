import { MenuBarExtra, Icon, launchCommand, LaunchType } from '@raycast/api';
import { useCachedState } from '@raycast/utils';
import { IncomingWebhook } from '@slack/webhook';
import dayjs, { Dayjs } from 'dayjs';

enum Status {
  // 退出中
  OFFLINE = 'offline',
  // Huddle
  ONLINE = 'online',
  // 一時退席
  LEAVE = 'leave',
}

const LEAVE_MINUTES = [30, 60, 120, 180];

const status2icon = (status: string | undefined): string => {
  switch (status) {
    case Status.ONLINE:
      return Icon.LightBulb;
    default:
      return Icon.LightBulbOff;
  }
};

const backTime = (min: number) => {
  const d = dayjs().add(min, 'minutes');

  return d.minute() < 30 ? d.minute(30) : d.add(1, 'hour').startOf('hour');
};

const timeIcon = (d: Dayjs) => {
  const TIME_ICON: Record<string, string> = {
    '1:00': '🕐',
    '1:30': '🕜',
    '2:00': '🕑',
    '2:30': '🕝',
    '3:00': '🕒',
    '3:30': '🕞',
    '4:00': '🕓',
    '4:30': '🕟',
    '5:00': '🕔',
    '5:30': '🕠',
    '6:00': '🕕',
    '6:30': '🕡',
    '7:00': '🕖',
    '7:30': '🕢',
    '8:00': '🕗',
    '8:30': '🕣',
    '9:00': '🕘',
    '9:30': '🕤',
    '10:00': '🕙',
    '10:30': '🕥',
    '11:00': '🕚',
    '11:30': '🕦',
    '12:00': '🕛',
    '12:30': '🕧',
  };

  return TIME_ICON[d.format('h:mm')];
};

export default function Command() {
  const [webhookEndpoint] = useCachedState(
    'minister-webhook-endpoint',
    ''
  );
  const [status, setStatus] = useCachedState('minister-status', Status.OFFLINE);

  const changeStatus = async (status: Status, text: string) => {
    if (!webhookEndpoint) return;

    const webhook = new IncomingWebhook(webhookEndpoint);

    await webhook.send({ text });

    setStatus(status);
  };

  return (
    <MenuBarExtra icon={status2icon(status)}>
      {webhookEndpoint && (
        <>
          <MenuBarExtra.Section title="Working">
            <MenuBarExtra.Item
              icon={Icon.LightBulb}
              title="Online"
              onAction={() =>
                changeStatus(Status.ONLINE, '😎 Huddle に 入室 しました')
              }
            />
            <MenuBarExtra.Submenu icon={Icon.LightBulbOff} title="Leave">
              {LEAVE_MINUTES.map((minute) => (
                <MenuBarExtra.Item
                  key={minute}
                  icon={Icon.CircleProgress25}
                  title={`about ${minute} min`}
                  onAction={async () => {
                    const d = backTime(minute);

                    await changeStatus(
                      Status.LEAVE,
                      `${timeIcon(d)} ${d.format('H:mm')} ごろまで 退室 します`
                    );
                  }}
                />
              ))}
            </MenuBarExtra.Submenu>
          </MenuBarExtra.Section>
          <MenuBarExtra.Section title="Business Time">
            <MenuBarExtra.Item
              icon={Icon.Sunrise}
              title="Good Morning"
              onAction={() =>
                changeStatus(Status.LEAVE, '☀️ おはようございます！')
              }
            />
            <MenuBarExtra.Submenu icon={Icon.Moon} title="Going Home">
              <MenuBarExtra.Item
                icon={Icon.Bird}
                title="Weekday"
                onAction={() =>
                  changeStatus(Status.OFFLINE, '🌙 おつかれさまでした！')
                }
              />
              <MenuBarExtra.Item
                icon={Icon.Stars}
                title="Weekend"
                onAction={() =>
                  changeStatus(Status.OFFLINE, '🍻 おつかれさまでした！')
                }
              />
            </MenuBarExtra.Submenu>
          </MenuBarExtra.Section>
        </>
      )}
      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          icon={Icon.Cog}
          title="Preferences"
          onAction={() =>
            launchCommand({
              name: 'preference',
              type: LaunchType.UserInitiated,
            })
          }
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
