import type { Mark } from "@prisma/client";
import { Link } from "@remix-run/react";
import { useState } from "react";

type MarkFormProps = {
  initial: Partial<Pick<Mark, "title" | "description" | "thumbnail">> & {
    link: string;
  };
};

export const MarkForm = ({ initial }: MarkFormProps) => {
  const [useImage, setUseImage] = useState(true);

  const isLoading = false;

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden">
      <form
        className="w-full md:w-3/4 lg:w-1/2 xl:w-1/3 flex h-full flex-col overflow-hidden p-0 border"
        action=""
        method="post"
      >
        <div className="flex-shrink-0 p-4 border-b">
          <h2 className="font-bold text-xl text-red">New Mark</h2>
          <a
            className="text-xs link"
            href={initial.link}
            target="_blank"
            rel="noreferrer"
          >
            {initial.link}
          </a>
          <input type="hidden" name="link" value={initial.link} />
        </div>

        <div className="flex-1 grid gap-4 overflow-y-scroll px-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Title</span>
            </label>
            <input
              type="text"
              name="title"
              className="input input-bordered w-full"
              disabled={isLoading}
              defaultValue={initial?.title ?? ""}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              disabled={isLoading}
              name="description"
              value={initial?.description ?? ""}
              readOnly
              rows={5}
            ></textarea>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Folder</span>
            </label>
            <select className="select select-bordered w-full" name="folder">
              <option></option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Tags</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="tags"
            />
            <label className="label">
              <span className="label-text-alt">Separated by comma</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Thumbnail</span>
            </label>
            <div className="aspect-video bg-base-300 relative">
              {initial?.thumbnail && useImage ? (
                <>
                  <input type="hidden" name="image" value={initial.thumbnail} />
                  <img src={initial.thumbnail} alt={initial.title ?? ""} />
                </>
              ) : null}

              <div className="absolute left-0 top-0 w-full h-full flex p-2 justify-end">
                <button
                  className="btn btn-xs"
                  type="button"
                  onClick={() => setUseImage(false)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action flex-shrink-0 p-4 border-t">
          <Link className="btn" to="/" replace>
            Cancel
          </Link>
          <button className="btn btn-primary" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
