import { z } from "zod";
import { CompositionProps } from "../../types/constants";
import { AlignEnd } from "./AlignEnd";
import { Button } from "./Button";
import { InputContainer } from "./Container";
import { Input } from "./Input";
import { Spacing } from "./Spacing";

export const RenderControls: React.FC<{
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  inputProps: z.infer<typeof CompositionProps>;
}> = ({ text, setText }) => {
  return (
    <InputContainer>
      <Input disabled={false} setText={setText} text={text}></Input>
      <Spacing></Spacing>
      <div className="text-sm text-neutral-600 leading-6">
        当前页面只保留本地预览。
        <br />
        这个 starter 原来的 Render 按钮走的是 Remotion Lambda（AWS 云渲染），
        当前项目还没有配置，所以先禁用，避免页面反复报错。
      </div>
      <Spacing></Spacing>
      <AlignEnd>
        <Button disabled onClick={() => undefined}>
          Render disabled
        </Button>
      </AlignEnd>
    </InputContainer>
  );
};
