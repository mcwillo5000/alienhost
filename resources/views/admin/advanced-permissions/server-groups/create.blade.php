@extends('layouts.admin')

@section('title')
    Create Server Group
@endsection

@section('content-header')
    <h1>Create Server Group<small>Give this group a name, then add servers on the next page.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.advanced-permissions') }}">Advanced Permissions</a></li>
        <li><a href="{{ route('admin.advanced-permissions.server-groups') }}">Server Groups</a></li>
        <li class="active">Create</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-md-6 col-md-offset-3">

            <form action="{{ route('admin.advanced-permissions.server-groups.store') }}" method="POST">
                {!! csrf_field() !!}

                <div class="box box-primary">
                    <div class="box-header with-border">
                        <h3 class="box-title">Group Details</h3>
                    </div>
                    <div class="box-body">

                        <div class="form-group {{ $errors->has('name') ? 'has-error' : '' }}">
                            <label for="name" class="control-label">
                                Name <span class="field-required"></span>
                            </label>
                            <input type="text"
                                   id="name"
                                   name="name"
                                   class="form-control"
                                   value="{{ old('name') }}"
                                   placeholder="e.g. Premium Servers"
                                   required />
                            @if ($errors->has('name'))
                                <span class="help-block">{{ $errors->first('name') }}</span>
                            @endif
                        </div>

                        <div class="form-group {{ $errors->has('description') ? 'has-error' : '' }}">
                            <label for="description" class="control-label">
                                Description <span class="field-optional"></span>
                            </label>
                            <textarea id="description"
                                      name="description"
                                      class="form-control"
                                      rows="3"
                                      placeholder="Optional description of this group…">{{ old('description') }}</textarea>
                            @if ($errors->has('description'))
                                <span class="help-block">{{ $errors->first('description') }}</span>
                            @endif
                        </div>

                    </div>
                    <div class="box-footer">
                        <a href="{{ route('admin.advanced-permissions.server-groups') }}"
                           class="btn btn-default btn-sm">Cancel</a>
                        <button type="submit" class="btn btn-success btn-sm pull-right">
                            <i class="fa fa-save"></i> Create Group
                        </button>
                    </div>
                </div>

            </form>

        </div>
    </div>
@endsection
